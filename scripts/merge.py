import os
import argparse
from pathlib import Path

DEFAULT_IGNORE_DIRS = {'.next', 'node_modules', '.git', 'out', 'build', 'coverage', 'public'}

DEFAULT_EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.json', '.md', '.env.example'}

def generate_tree(dir_path, prefix="", ignore_dirs=None):
    """Hàm tạo cấu trúc cây thư mục (ASCII Tree)"""
    if ignore_dirs is None:
        ignore_dirs = set()

    tree_str = ""
    try:
        paths = sorted(Path(dir_path).iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
    except PermissionError:
        return ""

    # Lọc bỏ các thư mục bị ignore
    valid_paths = [p for p in paths if not (p.is_dir() and p.name in ignore_dirs)]

    for i, path in enumerate(valid_paths):
        is_last = (i == len(valid_paths) - 1)
        connector = "└── " if is_last else "├── "
        tree_str += f"{prefix}{connector}{path.name}\n"

        if path.is_dir():
            extension = "    " if is_last else "│   "
            tree_str += generate_tree(path, prefix + extension, ignore_dirs)

    return tree_str

def merge_code(target_dir, output_file, ignore_dirs, extensions):
    """Hàm đọc và gộp code"""
    target_path = Path(target_dir).resolve()

    with open(output_file, 'w', encoding='utf-8') as outfile:
        # 1. In cấu trúc thư mục
        outfile.write(f"=== CẤU TRÚC THƯ MỤC: {target_path.name} ===\n\n")
        outfile.write(f"{target_path.name}/\n")
        outfile.write(generate_tree(target_path, ignore_dirs=ignore_dirs))
        outfile.write("\n" + "="*50 + "\n\n")

        # 2. In nội dung từng file
        outfile.write("=== NỘI DUNG SOURCE CODE ===\n\n")

        for root, dirs, files in os.walk(target_path):
            # Xóa các thư mục ignore để os.walk không đi sâu vào
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            for file in files:
                file_path = Path(root) / file

                # Kiểm tra định dạng file (hoặc lấy tất cả nếu extensions rỗng)
                if extensions and file_path.suffix.lower() not in extensions:
                    continue

                relative_path = file_path.relative_to(target_path)

                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()

                    # Viết header cho mỗi file
                    outfile.write(f"\n// {'-'*40}\n")
                    outfile.write(f"// File: {relative_path}\n")
                    outfile.write(f"// {'-'*40}\n\n")
                    outfile.write(content)
                    outfile.write("\n")
                except Exception as e:
                    outfile.write(f"\n// [LỖI] Không thể đọc file: {relative_path} ({str(e)})\n")

    print(f"Đã gộp thành công vào file: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script gộp code dự án Next.js")

    parser.add_argument("-d", "--dir", type=str, default=".",
                        help="Thư mục cần gộp (mặc định: thư mục hiện tại '.')")

    parser.add_argument("-o", "--out", type=str, default="merged_code.txt",
                        help="Tên file đầu ra (mặc định: merged_code.txt)")

    parser.add_argument("-a", "--all", action="store_true",
                        help="Lấy TẤT CẢ các file (bỏ qua bộ lọc extension mặc định)")

    args = parser.parse_args()

    extensions_to_use = set() if args.all else DEFAULT_EXTENSIONS

    merge_code(args.dir, args.out, DEFAULT_IGNORE_DIRS, extensions_to_use)