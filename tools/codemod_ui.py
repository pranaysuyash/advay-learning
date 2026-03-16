import os
import glob
import re

pages_dir = "/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages"
files = glob.glob(pages_dir + "/*.tsx")

# Robust pattern to match the tail end of the blue button
button_pattern_1 = re.compile(
    r"<motion\.button\b[^>]*?onClick={([^}]+)}[^>]*?bg-\[#3B82F6\][^>]*>[\s\S]*?(Start[^<]*)</motion\.button>"
)
button_pattern_2 = re.compile(
    r"<button\b[^>]*?onClick={([^}]+)}[^>]*?bg-\[#3B82F6\][^>]*>[\s\S]*?(Start[^<]*)</button>"
)

# Play buttons
button_pattern_3 = re.compile(
    r"<motion\.button\b[^>]*?onClick={([^}]+)}[^>]*?bg-\[#3B82F6\][^>]*>[\s\S]*?(Play[^<]*)</motion\.button>"
)
button_pattern_4 = re.compile(
    r"<button\b[^>]*?onClick={([^}]+)}[^>]*?bg-\[#3B82F6\][^>]*>[\s\S]*?(Play[^<]*)</button>"
)

import_pattern = re.compile(r"import\s+{[^}]*}\s+from\s+['\"]../components/game/GameStartButton['\"];?")

count = 0
for f in files:
    with open(f, "r") as file:
        content = file.read()
    
    orig_content = content
    
    # Replace motion.button
    content = button_pattern_1.sub(r'<div className="mt-8 flex justify-center w-full relative z-10"><GameStartButton onClick={\1} text="\2" /></div>', content)
    # Replace normal button
    content = button_pattern_2.sub(r'<div className="mt-8 flex justify-center w-full relative z-10"><GameStartButton onClick={\1} text="\2" /></div>', content)
    # Replace Play buttons
    content = button_pattern_3.sub(r'<div className="mt-8 flex justify-center w-full relative z-10"><GameStartButton onClick={\1} text="\2" /></div>', content)
    content = button_pattern_4.sub(r'<div className="mt-8 flex justify-center w-full relative z-10"><GameStartButton onClick={\1} text="\2" /></div>', content)
    
    if content != orig_content:
        # We need to add the import if it's missing
        if not import_pattern.search(content) and "GameStartButton" not in orig_content:
            # Find last import
            last_import_pos = content.rfind("import ")
            if last_import_pos != -1:
                end_of_line = content.find("\n", last_import_pos)
                if end_of_line != -1:
                    content = content[:end_of_line+1] + "import { GameStartButton } from '../components/game/GameStartButton';\n" + content[end_of_line+1:]
        
        with open(f, "w") as file:
            file.write(content)
        count += 1
        print(f"Updated {os.path.basename(f)}")

print(f"Updated GameStartButton in {count} files")
