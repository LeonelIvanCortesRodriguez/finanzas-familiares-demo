from hashlib import sha256
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_STORED

root = Path(__file__).resolve().parent.parent
release = root / "release"
release.mkdir(exist_ok=True)
excluded = {".git", "node_modules", "release", "test-results", "__pycache__"}
files = sorted((p for p in root.rglob("*") if p.is_file() and not any(part in excluded for part in p.relative_to(root).parts)), key=lambda p: p.relative_to(root).as_posix())
inventory = "".join(f"{sha256(p.read_bytes()).hexdigest()}  {p.relative_to(root).as_posix()}\n" for p in files)
(release / "CONTENT_INVENTORY.sha256").write_text(inventory, encoding="utf-8", newline="\n")
with ZipFile(release / "finanzas-familiares-demo.zip", "w") as archive:
    for source in files:
        info = ZipInfo(source.relative_to(root).as_posix(), date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = ZIP_STORED
        info.external_attr = 0o644 << 16
        archive.writestr(info, source.read_bytes())
print(f"BUILD_OK files={len(files)}")
for name in ("CONTENT_INVENTORY.sha256", "finanzas-familiares-demo.zip"):
    print(f"{name.upper().replace('.', '_')}_SHA256={sha256((release / name).read_bytes()).hexdigest()}")
