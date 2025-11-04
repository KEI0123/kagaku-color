// 初期の色配列（リセット用に保持）
const initialColors = [
    // 赤、青、緑、黄色、無色(透明)
    "#FF0000",
    "#0000FF",
    "#00FF00",
    "#FFFF00",
    "transparent",
];

// colors は実行時に localStorage から読み込む（編集可能）
let colors = [];

function loadColors() {
    try {
        const raw = localStorage.getItem('colors');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                colors = parsed;
                return;
            }
        }
    } catch (e) {
        console.warn('colors load failed', e);
    }
    colors = initialColors.slice();
}

function saveColors() {
    try { localStorage.setItem('colors', JSON.stringify(colors)); } catch (e) { console.warn('saveColors failed', e) }
}

const paletteEl = document.getElementById("palette");
const grid = document.getElementById("grid");
const maxIndexSpan = document.getElementById("maxIndex");
// 初期ロード
loadColors();
maxIndexSpan.textContent = colors.length;

// パレット表示（番号付き）
function renderPalette() {
    paletteEl.innerHTML = "";
    colors.forEach((c, i) => {
        const sw = document.createElement("div");
        sw.className = "swatch";
        // 削除ボタンをつける（data-index で参照）
        if (c === 'transparent') {
            // チェッカーボード風に見せる
            sw.innerHTML = `<span class="dot" style="background-image:repeating-linear-gradient(45deg,#eee 0 10px,#fff 0 20px);background-size:20px 20px;border:1px solid #cbd5e1"></span><span>${i + 1}</span><button class="remove" data-index="${i}" title="この色を削除">×</button>`;
        } else {
            sw.innerHTML = `<span class="dot" style="background:${c}"></span><span>${i + 1}</span><button class="remove" data-index="${i}" title="この色を削除">×</button>`;
        }
        paletteEl.appendChild(sw);
    });
}

// パレット内のボタン処理（削除など）
paletteEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove');
    if (btn) {
        const idx = Number(btn.dataset.index);
        if (!Number.isNaN(idx) && idx >= 0 && idx < colors.length) {
            colors.splice(idx, 1);
            saveColors();
            renderPalette();
            maxIndexSpan.textContent = colors.length;
        }
    }
});

function parseInput(str) {
    if (!str) return [];
    // 数字だけ抽出（例: '1, 3 5' -> ['1','3','5']）
    const matches = str.match(/\d+/g);
    if (!matches) return [];
    // 1-based の数字を0-based indexに変換し、重複除去
    const idxs = [...new Set(matches.map((s) => parseInt(s, 10) - 1))];
    // 有効な範囲のみにする
    return idxs.filter((n) => Number.isInteger(n) && n >= 0 && n < colors.length);
}

function fillGridWithRandom(selectedIdxs) {
    const cells = grid.querySelectorAll(".cell");
    const selectedColors = selectedIdxs.map((i) => colors[i]);
    if (selectedColors.length === 0) {
        alert("有効な番号がありません。1〜" + colors.length + " の範囲で指定してください。");
        return;
    }
    cells.forEach((cell, i) => {
        const c = selectedColors[Math.floor(Math.random() * selectedColors.length)];
        cell.style.background = c;
        // 文字色は背景が暗ければ白、明るければ黒
        const textColor = getContrastYIQ(c) === "dark" ? "#fff" : "#111";
        cell.style.color = textColor;
        cell.textContent = "";
    });
}

// 単純な輝度チェック（コントラスト）
function getContrastYIQ(hexcolor) {
    // 非HEX（例: 'transparent'）は明色扱いにする
    if (typeof hexcolor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(hexcolor)) return 'light';
    const c = hexcolor.replace("#", "");
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    // 明るければ 'light'（黒文字）、暗ければ 'dark'（白文字）
    return yiq >= 128 ? "light" : "dark";
}

// クリア
function clearGrid() {
    grid.querySelectorAll(".cell").forEach((cell) => {
        cell.style.background = "linear-gradient(180deg,#fff,#fbfdff)";
        cell.textContent = "";
        cell.style.color = "#111";
    });
}

// イベント
document.getElementById("fillBtn").addEventListener("click", () => {
    // 入力欄を削除したため、常に登録されている全色を対象にランダム表示する
    const idxs = colors.map((_, i) => i);
    fillGridWithRandom(idxs);
});
document.getElementById("clearBtn").addEventListener("click", clearGrid);

// 色の追加処理
document.getElementById('addColorBtn')?.addEventListener('click', () => {
    const text = (document.getElementById('colorText')?.value || '').trim();
    const picker = (document.getElementById('colorPicker')?.value || '').trim();
    let hex = '';
    if (text) { hex = text; }
    else if (picker) { hex = picker; }
    if (!hex) return alert('色を入力するかカラーピッカーを選んでください');
    // 正規化: #がない場合は追加、上位小文字->大文字
    if (!hex.startsWith('#')) hex = '#' + hex;
    hex = hex.toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(hex)) return alert('有効な HEX 形式ではありません。例: #FF0000');
    colors.push(hex);
    saveColors();
    renderPalette();
    maxIndexSpan.textContent = colors.length;
    // クリア入力
    const ct = document.getElementById('colorText'); if (ct) ct.value = '';
});

// リセット
document.getElementById('resetColorsBtn')?.addEventListener('click', () => {
    if (!confirm('色を初期値に戻しますか？保存済みの色は上書きされます。')) return;
    colors = initialColors.slice();
    saveColors();
    renderPalette();
    maxIndexSpan.textContent = colors.length;
});

// 初期描画
renderPalette();
clearGrid();
