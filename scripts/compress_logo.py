from PIL import Image
import os
import sys

def compress_image(input_path, output_path, target_size_kb=45):
    try:
        if not os.path.exists(input_path):
            print(f"Error: Input file not found: {input_path}")
            return

        img = Image.open(input_path)
        
        # 1. Resize if huge
        if img.width > 512:
            img = img.resize((512, 512), Image.Resampling.LANCZOS)

        # 2. Convert to RGBA (handling transparency) or RGB if needed
        # PNG keeps transparency.
        
        # 3. Save with optimization
        # We can't strictly control KB size in one go with PNG, but we can try optimize=True and reduce colors if needed.
        # For strict size, WebP is better, but user wants PNG probably.
        # Let's try aggressive PNG optimization first.
        
        # Attempt 1: Standard Optimize
        img.save(output_path, "PNG", optimize=True)
        
        size_kb = os.path.getsize(output_path) / 1024
        print(f"Initial compression: {size_kb:.2f} KB")

        if size_kb > target_size_kb:
            # Attempt 2: Quantize (Reduce colors) - this drastically reduces size for logos
            print("Quantizing to reduce size...")
            img_quantized = img.quantize(colors=128, method=2)
            img_quantized.save(output_path, "PNG", optimize=True)
            
            size_kb = os.path.getsize(output_path) / 1024
            print(f"Quantized compression: {size_kb:.2f} KB")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    input_file = r"C:\Users\MohamedZuhail\.gemini\antigravity\brain\c2c8cadd-0ab2-48d1-b71d-ee84eb2e85b7\uploaded_image_1765980385642.png"
    output_file = r"C:\Users\MohamedZuhail\.gemini\Zhatn\public\zhatn-logo-optimized.png"
    compress_image(input_file, output_file)
