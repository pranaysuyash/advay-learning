import re

with open("src/frontend/src/App.tsx", "r") as f:
    text = f.read()

# Extract exactly the contents of <Routes> ... </Routes>
routes_match = re.search(r'<Routes>(.*?)</Routes>', text, re.DOTALL)
if not routes_match:
    print("Could not find <Routes> block")
    exit(1)

routes_inner = routes_match.group(1)

# Basic pattern for a <Route /> tag (including nested)
# Since they are fairly regular, we can split them roughly by "<Route" and "/>" (sometimes nested though)
# Actually, the quickest way to parse it is with regex taking into account that there are no nested <Route> tags, only nested elements!
# Every route starts with <Route and ends with /> but we must be careful.
# Let's use a simple state machine:
routes = []
current_route = ""
depth = 0
in_route = False

for i in range(len(routes_inner)):
    c = routes_inner[i]
    if routes_inner[i:i+6] == "<Route":
        if not in_route:
            in_route = True
            current_route = ""
            
    if in_route:
        current_route += c
        # count braces / tags? Actually simpler: "/>" closes the Route if we are at the top level of the self-closing tag.
        # But wait, elements contain /> too.
        # Let's just find the `path=` and inner content.
        
route_blocks = re.findall(r'<Route\s+path=[\'"]([^\'"]+)[\'"]\s+element=\{(.*?)\}\s*/>(?:.*?)(?=<Route|</Routes>|$)', routes_inner + "</Routes>", re.DOTALL)

app_routes_str = "const appRoutes: AppRoute[] = [\n"

print(f"Found {len(route_blocks)} routes!")

for path, element_content in route_blocks:
    # check for Navigate
    nav_match = re.search(r'<Navigate\s+to=[\'"]([^\'"]+)[\'"]', element_content)
    if nav_match:
        app_routes_str += f"  {{ path: '{path}', element: <></>, redirectTo: '{nav_match.group(1)}' }},\n"
        continue

    # Identify component
    comp_match = re.search(r'<([A-Z]\w+)\s*/>', element_content)
    if not comp_match:
        comp_match = re.search(r'<([A-Z]\w+)\s*>', element_content) # e.g. <VerifyEmail></VerifyEmail>
        if not comp_match:
            print(f"Failed to find component for {path}")
            continue
            
    component = f"<{comp_match.group(1)} />"
    
    is_protected = "<ProtectedRoute>" in element_content
    is_layout = "<Layout>" in element_content
    
    camera_match = re.search(r"<CameraSafeRoute\s+gameName=['\"]([^'\"]+)['\"]>", element_content)
    is_camera = camera_match is not None
    
    props = []
    props.append(f"path: '{path}'")
    props.append(f"element: {component}")
    if is_protected:
        props.append("protected: true")
    if is_layout:
        props.append("layout: true")
    if is_camera:
        props.append("cameraSafe: true")
        props.append(f"gameName: '{camera_match.group(1)}'")
        
    app_routes_str += "  { " + ", ".join(props) + " },\n"

app_routes_str += "];\n"

# Replace <Routes>...</Routes> with our new code
new_routes_jsx = """
                <Routes>
                  {appRoutes
                    .filter((route) => !route.devOnly || import.meta.env.DEV)
                    .map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={
                          route.redirectTo
                            ? <Navigate to={route.redirectTo} replace />
                            : wrapRoute(route)
                        }
                      />
                    ))}
                </Routes>
"""

text = text.replace(f"<Routes>{routes_inner}</Routes>", new_routes_jsx)

# Define AppRoute and wrapRoute exactly above `function App()`
types_and_helpers = """
export type AppRoute = {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  layout?: boolean;
  cameraSafe?: boolean;
  gameName?: string;
  cameraRequiredMessage?: string;
  devOnly?: boolean;
  redirectTo?: string;
};

function wrapRoute(route: AppRoute) {
  let element = route.element;

  if (route.cameraSafe) {
    element = (
      <CameraSafeRoute
        gameName={route.gameName ?? 'Game'}
        cameraRequiredMessage={route.cameraRequiredMessage}
      >
        {element}
      </CameraSafeRoute>
    );
  }

  if (route.layout) {
    element = <Layout>{element}</Layout>;
  }

  if (route.protected) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }

  return element;
}

""" + app_routes_str + "\n"

text = text.replace("function App() {", types_and_helpers + "function App() {")

with open("src/frontend/src/App.tsx", "w") as f:
    f.write(text)
