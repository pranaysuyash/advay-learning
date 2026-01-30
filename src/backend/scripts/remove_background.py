import os

from PIL import Image


def remove_white_background(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Check if pixel is white (with some tolerance)
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Saved transparent image to {output_path}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    # Paths relative to src/backend
    input_p = "../../src/frontend/public/assets/images/pip_mascot_original.png"
    output_p = "../../src/frontend/public/assets/images/pip_mascot.png"

    # Resolve absolute paths just in case
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Script is in src/backend/scripts
    # So base is src/backend/scripts
    # We want to go up 3 levels to root? No, relative path from execution dir (src/backend)

    # Let's use absolute paths to be safe
    # We are running from src/backend usually

    cwd = os.getcwd()
    print(f"Current working directory: {cwd}")

    # Assuming we run from src/backend
    remove_white_background(input_p, output_p)
