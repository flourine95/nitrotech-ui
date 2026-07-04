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

    valid_paths = [p for p in paths if not (p.is_dir() and p.name in ignore_dirs)]

    for i, path in enumerate(valid_paths):
        is_last = (i == len(valid_paths) - 1)
        connector = "└── " if is_last else "├── "
        tree_str += f"{prefix}{connector}{path.name}\n"

        if path.is_dir():
            extension = "    " if is_last else "│   "
            tree_str += generate_tree(path, prefix + extension, ignore_dirs)

    return tree_str

def read_and_write_file(file_path, root_path, outfile, extensions):
    """Hàm phụ trợ để kiểm tra extension và ghi nội dung file vào outfile"""
    # Nếu có bộ lọc extension và file không khớp -> Bỏ qua
    if extensions and file_path.suffix.lower() not in extensions:
        return

    # Tính đường dẫn hiển thị trực quan
    if root_path.is_dir():
        relative_path = Path(root_path.name) / file_path.relative_to(root_path)
    else:
        relative_path = file_path.name

    try:
        with open(file_path, 'r', encoding='utf-8') as infile:
            content = infile.read()

        outfile.write(f"\n// {'-'*40}\n")
        outfile.write(f"// File: {relative_path}\n")
        outfile.write(f"// {'-'*40}\n\n")
        outfile.write(content)
        outfile.write("\n")
    except Exception as e:
        outfile.write(f"\n// [LỖI] Không thể đọc file: {relative_path} ({str(e)})\n")

def merge_code(inputs, output_file, ignore_dirs, extensions):
    """Hàm đọc và gộp code từ danh sách FILE và FOLDER"""
    if ignore_dirs is None:
        ignore_dirs = set()

    with open(output_file, 'w', encoding='utf-8') as outfile:

        # === PHẦN 1: IN CẤU TRÚC THƯ MỤC / DANH SÁCH FILE ĐẦU VÀO ===
        outfile.write("=== DANH SÁCH ĐẦU VÀO CẦN GỘP ===\n")
        for item in inputs:
            item_path = Path(item).resolve()
            if not item_path.exists():
                print(f"[CẢNH BÁO] Đường dẫn không tồn tại: {item}")
                continue

            if item_path.is_dir():
                outfile.write(f"\n[FOLDER] {item_path.name}/\n")
                outfile.write(generate_tree(item_path, ignore_dirs=ignore_dirs))
            else:
                outfile.write(f"[FILE]   {item_path.name}\n")
        outfile.write("\n" + "="*50 + "\n\n")

        # === PHẦN 2: GỘP NỘI DUNG SOURCE CODE ===
        outfile.write("=== NỘI DUNG SOURCE CODE ===\n\n")

        for item in inputs:
            item_path = Path(item).resolve()
            if not item_path.exists():
                continue

            if item_path.is_file():
                # Nếu đầu vào là file đơn lẻ, đọc luôn (bỏ qua lọc extension để linh hoạt, hoặc giữ lại tùy bạn)
                read_and_write_file(item_path, item_path, outfile, extensions=None)

            elif item_path.is_dir():
                # Nếu là thư mục, duyệt os.walk như cũ
                for root, dirs, files in os.walk(item_path):
                    dirs[:] = [d for d in dirs if d not in ignore_dirs]

                    for file in files:
                        file_path = Path(root) / file
                        read_and_write_file(file_path, item_path, outfile, extensions)

    print(f"Đã gộp thành công vào file: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script gộp code dự án linh hoạt (File & Folder)")

    # Sử dụng nargs="+" để nhận nhiều tham số cách nhau bởi dấu cách
    parser.add_argument("-d", "--dir", type=str, nargs="+", default=["."],
                        help="Danh sách các file hoặc thư mục cần gộp (mặc định: '.')")

    parser.add_argument("-o", "--out", type=str, default="merged_code.txt",
                        help="Tên file đầu ra (mặc định: merged_code.txt)")

    parser.add_argument("-a", "--all", action="store_true",
                        help="Lấy TẤT CẢ các file (bỏ qua bộ lọc extension mặc định)")

    args = parser.parse_args()

    extensions_to_use = set() if args.all else DEFAULT_EXTENSIONS

    # Truyền args.dir (lúc này là một list chứa cả file và folder) vào hàm xử lý
    merge_code(args.dir, args.out, DEFAULT_IGNORE_DIRS, extensions_to_use)