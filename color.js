// ここで色配列を用意します（必要なら追加・編集してください）
const colors = [
    "#FF6633",
    "#FFB399",
    "#FF33FF",
    "#FFFF99",
    "#00B3E6",
    "#E6B333",
    "#3366E6",
    "#999966",
    "#99FF99",
    "#B34D4D",
    "#80B300",
    "#809900",
    "#E6B3B3",
    "#6680B3",
    "#66991A",
    "#FF99E6",
    "#CCFF1A",
    "#FF1A66",
    "#E6331A",
    "#33FFCC",
];

const paletteEl = document.getElementById("palette");
const grid = document.getElementById("grid");
const maxIndexSpan = document.getElementById("maxIndex");
maxIndexSpan.textContent = colors.length;

// パレット表示（番号付き）
function renderPalette() {
    paletteEl.innerHTML = "";
    colors.forEach((c, i) => {
        const sw = document.createElement("div");
        sw.className = "swatch";
        sw.innerHTML = `<span class="dot" style="background:${c}"></span><span>${i + 1}</span>`;
        paletteEl.appendChild(sw);
    });
}

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
    const c = hexcolor.replace("#", "");
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "dark" : "light";
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
    const v = document.getElementById("nums").value;
    const idxs = parseInput(v);
    if (idxs.length === 0) {
        alert("有効な番号が見つかりませんでした。入力例: 1,3,5");
        return;
    }
    fillGridWithRandom(idxs);
});
document.getElementById("clearBtn").addEventListener("click", clearGrid);

// 初期描画
renderPalette();
clearGrid();
