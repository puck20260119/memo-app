// ===== フィルタ状態 =====
let currentFilter = "all";

function setFilter(filter) {
  currentFilter = filter;
  renderMemoList();
}

// ===== テーマごとの背景色 =====
const themeColors = {
  仕事: "#e3f2fd",
  読書: "#fff8e1",
  日記: "#fce4ec",
  アイデア: "#e8f5e9"
};

let memos = [];
let editingIndex = null;

// ===== 背景色を適用 =====
function applyThemeColor(theme) {
  document.body.style.backgroundColor =
    themeColors[theme] || "#f9f9f9";
}

// ===== 保存 =====
function saveMemo() {
  const saved = localStorage.getItem("memos");
  if (saved) {
    memos = JSON.parse(saved);
  }

  const theme = document.getElementById("theme").value;
  const text = document.querySelector("textarea").value;
  const status = document.getElementById("status").value;

  if (!theme) return;

  const memo = { theme, text, status };

  if (editingIndex !== null) {
    memos[editingIndex] = memo;
    editingIndex = null;
  } else {
    memos.push(memo);
  }

  localStorage.setItem("memos", JSON.stringify(memos));
  renderMemoList();
  clearEditor();
}
function deleteMemo(index) {
  if (!confirm("このメモを削除しますか？")) {
    return;
  }

  memos.splice(index, 1);
  localStorage.setItem("memos", JSON.stringify(memos));
  renderMemoList();
  clearEditor();
}


// ===== 一覧描画 =====
function renderMemoList() {
  const list = document.getElementById("memoList");
  list.innerHTML = "";

  memos.forEach((memo, index) => {

    // 旧データ救済
    if (!memo.status) {
      memo.status = "draft";
    }

    // フィルタ判定
    if (
      currentFilter !== "all" &&
      memo.status !== currentFilter
    ) {
      return;
    }

    const li = document.createElement("li");

    const statusMark =
      memo.status === "published" ? "🌍" : "📝";

    const emptyMark =
      !memo.text || memo.text.trim() === "" ? "（未記入）" : "";

 const titleSpan = document.createElement("span");
titleSpan.textContent = `${statusMark} ${memo.theme} ${emptyMark}`;
titleSpan.style.cursor = "pointer";
titleSpan.onclick = () => loadMemo(index);

const deleteBtn = document.createElement("button");
deleteBtn.textContent = "🗑";
deleteBtn.className = "delete-btn";
deleteBtn.style.marginLeft = "8px";
deleteBtn.onclick = (e) => {
  e.stopPropagation();
  deleteMemo(index);
};

li.appendChild(titleSpan);
li.appendChild(deleteBtn);


    list.appendChild(li);
  });

  localStorage.setItem("memos", JSON.stringify(memos));
}

// ===== メモ読み込み =====
function loadMemo(index) {
  const memo = memos[index];

  document.getElementById("theme").value = memo.theme;
  document.querySelector("textarea").value = memo.text || "";
  document.getElementById("status").value =
    memo.status || "draft";

  applyThemeColor(memo.theme);
  editingIndex = index;
}

// ===== クリア =====
function clearEditor() {
  document.getElementById("theme").value = "";
  document.getElementById("status").value = "draft";
  document.querySelector("textarea").value = "";
  document.body.style.backgroundColor = "#f9f9f9";
}

// ===== 初期読み込み =====
window.onload = () => {
  const saved = localStorage.getItem("memos");
  if (saved) {
    memos = JSON.parse(saved);
    renderMemoList();
  }
};

function exportMemos() {
  const data = JSON.stringify(memos, null, 2);

  const blob = new Blob([data], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "memos.json";
  a.click();

  URL.revokeObjectURL(url);
}
function importMemos() {
  const input = document.getElementById("importFile");
  const file = input.files[0];

  if (!file) {
    alert("ファイルを選んでください");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("形式が正しくありません");
        return;
      }

      memos = imported;
      saveMemos();
      renderMemos();

      alert("読み込み完了しました！");
    } catch (err) {
      alert("読み込みに失敗しました");
    }
  };

  reader.readAsText(file);
}
