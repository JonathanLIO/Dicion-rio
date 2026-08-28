// Elementos do DOM
const wordForm = document.getElementById('word-form');
const wordInput = document.getElementById('word-input');
const meaningInput = document.getElementById('meaning-input');
const wordIdInput = document.getElementById('word-id');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const grammarFilter = document.getElementById('grammar-filter');
const wordListContainer = document.getElementById('word-list');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const grammarCheckboxes = document.querySelectorAll('input[name="grammar"]');

// Gerenciamento de Tema
const currentTheme = localStorage.getItem('dictionary_theme') || 'light';
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('dictionary_theme', 'light');
        themeToggleBtn.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('dictionary_theme', 'dark');
        themeToggleBtn.textContent = '☀️';
    }
});

// Mapeamento de categorias gramaticais para seus respectivos sufixos estilizados
const grammarDetails = {
    "Verbo": "pol",
    "Adjetivo": "wo",
    "Advérbio": "jam"
    // Para adicionar novas categorias com detalhe no futuro, basta incluir aqui:
    // "OutraCategoria": "sufixo"
};

// Carregar palavras do LocalStorage ou iniciar array vazio
let words = JSON.parse(localStorage.getItem('dictionary_words')) || [];

function saveDataAndRender() {
    localStorage.setItem('dictionary_words', JSON.stringify(words));
    renderWords();
}

// Renderizar a lista de palavras na tela
function renderWords() {
    wordListContainer.innerHTML = '';
    const filterText = searchInput.value.toLowerCase();
    const selectedGrammarFilter = grammarFilter.value;

    const filteredWords = words.filter(item => {
        const matchesText = item.word.toLowerCase().includes(filterText) || item.meaning.toLowerCase().includes(filterText);
        const matchesGrammar = selectedGrammarFilter === '' || (item.grammar && item.grammar.includes(selectedGrammarFilter));
        return matchesText && matchesGrammar;
    });

    if (filteredWords.length === 0) {
        wordListContainer.innerHTML = '<div class="empty-message">Nenhuma palavra encontrada.</div>';
        return;
    }

    filteredWords.sort((a, b) => a.word.localeCompare(b.word));

    filteredWords.forEach(item => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';

        // Gerar tags HTML para os tipos gramaticais
        let tagsHtml = '';
        if (item.grammar && item.grammar.length > 0) {
            tagsHtml = '<div class="grammar-tags">' + 
                item.grammar.map(g => {
                    const escapedG = escapeHtml(g);
                    // Verifica se existe um detalhe para esta categoria no nosso mapeamento
                    if (grammarDetails[g]) {
                        return `<span class="grammar-tag">${escapedG}–<span class="unmun">${grammarDetails[g]}</span></span>`;
                    }
                    return `<span class="grammar-tag">${escapedG}</span>`;
                }).join('') + 
                '</div>';
        }

        wordItem.innerHTML = `
            <div class="word-content">
                ${tagsHtml}
                <h3 class="unmun">${escapeHtml(item.word)}</h3>
                <p>${escapeHtml(item.meaning)}</p>
            </div>
            <div class="word-actions">
                <button class="btn-edit" onclick="editWord('${item.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteWord('${item.id}')">Excluir</button>
            </div>
        `;
        wordListContainer.appendChild(wordItem);
    });
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Adicionar ou Atualizar Palavra
// Adicionar ou Atualizar Palavra
wordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const wordText = wordInput.value.trim();
    const meaningText = meaningInput.value.trim();
    const id = wordIdInput.value;

    // Coletar tipos gramaticais marcados
    const selectedGrammars = Array.from(grammarCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    // Verifica se já existe uma palavra igual (ignorando maiúsculas/minúsculas)
    // Se estiver editando, ignoramos a própria palavra que está sendo alterada
    const wordExists = words.some(item => 
        item.word.toLowerCase() === wordText.toLowerCase() && item.id !== id
    );

    if (wordExists) {
        alert('Esta palavra já está cadastrada no dicionário!');
        return;
    }

    if (id) {
        const index = words.findIndex(item => item.id === id);
        if (index !== -1) {
            words[index].word = wordText;
            words[index].meaning = meaningText;
            words[index].grammar = selectedGrammars;
        }
    } else {
        const newWord = {
            id: Date.now().toString(),
            word: wordText,
            meaning: meaningText,
            grammar: selectedGrammars
        };
        words.push(newWord);
    }
    resetForm();
    saveDataAndRender();
});

// Editar Palavra
window.editWord = function(id) {
    const itemToEdit = words.find(item => item.id === id);
    if (itemToEdit) {
        wordIdInput.value = itemToEdit.id;
        wordInput.value = itemToEdit.word;
        meaningInput.value = itemToEdit.meaning;
        
        // Marcar os checkboxes correspondentes
        grammarCheckboxes.forEach(checkbox => {
            checkbox.checked = itemToEdit.grammar && itemToEdit.grammar.includes(checkbox.value);
        });

        formTitle.textContent = 'Editar Palavra';
        saveBtn.textContent = 'Atualizar Palavra';
        cancelBtn.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Deletar palavra
window.deleteWord = function(id) {
    if (confirm('Tem certeza que deseja excluir esta palavra?')) {
        words = words.filter(item => item.id !== id);
        saveDataAndRender();
    }
}

cancelBtn.addEventListener('click', () => {
    resetForm();
});

function resetForm() {
    wordForm.reset();
    wordIdInput.value = '';
    grammarCheckboxes.forEach(cb => cb.checked = false);
    formTitle.textContent = 'Adicionar Nova Palavra';
    saveBtn.textContent = 'Salvar Palavra';
    cancelBtn.style.display = 'none';
}

searchInput.addEventListener('input', () => {
    renderWords();
});

grammarFilter.addEventListener('change', () => {
    renderWords();
});

// **Exportar e Importar Backup**
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

// Exportar palavras para um arquivo JSON usando Blob
exportBtn.addEventListener('click', () => {
    console.log("Entrou nl event listener")
    if (words.length === 0) {
        alert('Não há palavras cadastradas para exportar.');
        return;
    }
    
    console.log(1)
    // Cria um Blob com os dados em JSON formatado
    const dataStr = JSON.stringify(words, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    
    console.log(2)
    // Gera uma URL temporária para o blob
    const url = URL.createObjectURL(blob);
    
    console.log(3)
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `backup_dicionario_${new Date().toISOString().slice(0, 10)}.json`;
    
    console.log(4)
    // Adiciona ao DOM, dispara o clique e remove logo em seguida
    document.body.appendChild(downloadAnchor);
    
    console.log(5)
    // Pequeno atraso para garantir que o navegador processe o evento de download
    setTimeout(() => {
        console.log(6)
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url); // Libera a memória da URL temporária
    }, 50);
});

// Acionar o input de arquivo oculto ao clicar no botão de importar
importBtn.addEventListener('click', () => {
    importFile.click();
});

// Ler o arquivo JSON selecionado e restaurar os dados
importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedData)) {
                throw new Error('O formato do arquivo é inválido.');
            }

            if (confirm(`Deseja substituir as palavras atuais pelas do backup ou mesclar? \nOK = Substituir tudo | Cancelar = Mesclar (adicionar junto)`)) {
                words = importedData;
            } else {
                // Mescla evitando IDs duplicados
                importedData.forEach(item => {
                    if (!words.some(w => w.id === item.id)) {
                        words.push(item);
                    }
                });
            }

            saveDataAndRender();
            alert('Backup importado com sucesso!');
        } catch (error) {
            alert('Erro ao ler o arquivo de backup. Certifique-se de que é um JSON válido.');
            console.error(error);
        } finally {
            importFile.value = ''; // Reseta o input para permitir reimportar o mesmo arquivo se necessário
        }
    };
    reader.readAsText(file);
});

renderWords();
    
