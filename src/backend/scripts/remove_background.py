import os

from PIL import Image


def remove_white_background(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        img: Image.Image = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        new_data: list[tuple[int, int, int, int]] = []
        for item in datas:  # type: ignore[attr-defined]
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
    import sys

    # Check for CLI args
    if len(sys.argv) > 2:
        input_p = sys.argv[1]
        output_p = sys.argv[2]
    else:
        # Defaults
        input_p = "../../src/frontend/public/assets/images/pip_mascot_original.png"
        output_p = "../../src/frontend/public/assets/images/pip_mascot.png"

    cwd = os.getcwd()
    print(f"Current working directory: {cwd}")

    remove_white_background(input_p, output_p)
