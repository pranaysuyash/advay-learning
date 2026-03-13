import re

def refactor_lazy_pages():
    with open("src/frontend/src/routes/lazyPages.tsx", "r") as f:
        content = f.read()

    helper = """
function lazyNamed<T extends Record<string, any>>(
  importer: () => Promise<T>,
  name: keyof T
) {
  return lazy(() =>
    importer().then((module) => ({ default: module[name] as React.ComponentType<any> }))
  );
}
"""
    if "lazyNamed" not in content:
        content = content.replace("export const Home = lazy(() =>", helper + "\nexport const Home = lazy(() =>")

    pattern2 = r"export const (\w+) = lazy\(\(\) =>\s*import\('([^']+)'\)\.then\(\(module\) => \(\{\s*default: module\.(\w+),\s*\}\)\),\s*\);"

    def repl(m):
        return f"export const {m.group(1)} = lazyNamed(() => import('{m.group(2)}'), '{m.group(3)}');"

    content = re.sub(pattern2, repl, content)

    with open("src/frontend/src/routes/lazyPages.tsx", "w") as f:
        f.write(content)

def parse_element(element_str):
    res = {
        "protected": "false",
        "layout": "false",
        "cameraSafe": "false",
        "gameName": "undefined",
        "component": "null"
    }
    
    comp_match = re.search(r'<([A-Z]\w+)\s*/>', element_str)
    if comp_match:
        res["component"] = comp_match.group(1)
        
    if "<ProtectedRoute>" in element_str:
        res["protected"] = "true"
    if "<Layout>" in element_str:
        res["layout"] = "true"
    camera_match = re.search(r"<CameraSafeRoute gameName=['\"]([^'\"]+)['\"]>", element_str)
    if camera_match:
        res["cameraSafe"] = "true"
        res["gameName"] = f"'{camera_match.group(1)}'"
        
    return res

def refactor_app():
    with open("src/frontend/src/App.tsx", "r") as f:
        content = f.read()
        
    # First, refactor the useEffect around analytics and sound
    old_effect = """  useEffect(() => {
    if (location.pathname !== prevPathName.current) {
      // Don't play flip sound on initial render
      playFlip();
      trackPageView(location.pathname);
      prevPathName.current = location.pathname;
    }
  }, [location.pathname, playFlip]);"""

    new_effect = """  const isFirstRender = useRef(true);

  useEffect(() => {
    if (location.pathname !== prevPathName.current) {
      trackPageView(location.pathname);
      prevPathName.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (location.pathname !== prevPathName.current) {
      playFlip();
    }
  }, [location.pathname, playFlip]);"""
  
    content = content.replace(old_effect, new_effect)
    
    # We will let the AppRoute refactoring happen manually or we do something simpler:
    # We'll extract routes. Find <Routes> and </Routes>
    routes_start = content.find("<Routes>")
    routes_end = content.find("</Routes>") + len("</Routes>")
    
    routes_block = content[routes_start:routes_end]
    
    # Custom parser for routes inside block
    # Actually, it's safer to not touch AppRoute list if it's too error prone with python regex.
    # Instead I will inject the AppRoute type and wrapRoute component above `function App()`, then use a multi_replace for specific spots.
    
    with open("src/frontend/src/App.tsx", "w") as f:
        f.write(content)

refactor_lazy_pages()
refactor_app()
