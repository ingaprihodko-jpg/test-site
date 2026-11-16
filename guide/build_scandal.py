"""Карта прогрева «Какой скандал!»: scandal-warmup.src.html → scandal-warmup.pdf

Запуск: python3 guide/build_scandal.py
"""
import shutil
import subprocess
import tempfile
from pathlib import Path

from build import CHROME, ROOT, glue

out = ROOT / 'scandal-warmup.html'
out.write_text(glue((ROOT / 'scandal-warmup.src.html').read_text(encoding='utf-8')), encoding='utf-8')
tmp = Path(tempfile.gettempdir()) / 'scandal-warmup.pdf'
tmp.unlink(missing_ok=True)
subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=10000',
                f'--print-to-pdf={tmp}', out.resolve().as_uri()], stderr=subprocess.DEVNULL)
shutil.move(tmp, ROOT / 'scandal-warmup.pdf')
