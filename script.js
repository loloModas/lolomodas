// ===== CONFIGURAÇÃO PADRÃO =====
const CONFIG_PADRAO = {
    cores: {
        primaria: "#8B4513",
        secundaria: "#D2691E", 
        destaque: "#CD853F",
        texto: "#3E2723",
        fundo: "#fefaf6"
    },
    textos: {
        nomeLoja: "Lolo Modas",
        descricao: "Especializada em calçados masculinos e femininos de qualidade.",
        telefone: "(11) 9999-9999", 
        email: "contato@lolomodas.com"
    },
    banner: {
        titulo: "Calçados de Qualidade para Todos os Estilos",
        subtitulo: "Encontre os melhores calçados masculinos e femininos com conforto, estilo e preços incríveis!",
        botao: "Ver Coleção"
    },
    produtos: []
};

// ===== ESTADO DA APLICAÇÃO =====
let estado = {
    carrinho: [],
    favoritos: new Set(),
    filtroAtivo: 'todos',
    imagemAtualModal: 0,
    produtoAtualModal: null,
    paginaAtual: 'home'
};

// ===== FUNÇÕES PRINCIPAIS - LOJA =====

// Carregar personalização
function carregarPersonalizacao() {
    const configSalva = localStorage.getItem('loloModasConfig');
    const config = configSalva ? JSON.parse(configSalva) : CONFIG_PADRAO;
    
    // Aplicar cores
    if (config.cores) {
        document.documentElement.style.setProperty('--primary', config.cores.primaria);
        document.documentElement.style.setProperty('--secondary', config.cores.secundaria);
        document.documentElement.style.setProperty('--accent', config.cores.destaque);
        document.documentElement.style.setProperty('--dark', config.cores.texto);
        document.body.style.backgroundColor = config.cores.fundo;
    }
    
    // Aplicar textos
    if (config.textos) {
        document.getElementById('lojaNome').textContent = config.textos.nomeLoja;
        document.getElementById('footerNome').textContent = config.textos.nomeLoja;
        document.getElementById('footerDescricao').textContent = config.textos.descricao;
        document.getElementById('footerTelefone').textContent = config.textos.telefone;
        document.getElementById('footerEmail').textContent = config.textos.email;
    }
    
    // Aplicar banner
    if (config.banner) {
        document.getElementById('bannerTitulo').textContent = config.banner.titulo;
        document.getElementById('bannerSubtitulo').textContent = config.banner.subtitulo;
        document.getElementById('bannerBotao').textContent = config.banner.botao;
    }
}

// Carregar produtos
function carregarProdutosPersonalizados() {
    const configSalva = localStorage.getItem('loloModasConfig');
    const config = configSalva ? JSON.parse(configSalva) : CONFIG_PADRAO;
    const container = document.getElementById('produtosContainer');
    
    if (!config.produtos || config.produtos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shoe-prints"></i>
                <h3>Nenhum produto cadastrado</h3>
                <p>Visite o painel administrativo para adicionar produtos.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = config.produtos.map(produto => {
        const imagens = produto.imagens || [produto.imagem];
        const imagemPrincipal = imagens[0];

        return `
            <div class="product-card" data-categoria="${produto.categoria}">
                <div class="product-image">
                    <img src="${imagemPrincipal}" alt="${produto.nome}" 
                         onerror="this.src='https://via.placeholder.com/300x200/CCCCCC/666666?text=Imagem+Indisponível'"
                         onclick="verDetalhes(${produto.id})">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${produto.nome}</h3>
                    <div class="product-price">R$ ${produto.preco.toFixed(2)}</div>
                    <div class="product-actions-bottom">
                        <button class="add-to-cart" onclick="adicionarAoCarrinho(${produto.id})">
                            <i class="fas fa-shopping-cart"></i> Carrinho
                        </button>
                        <button class="whatsapp-btn" onclick="contatarWhatsapp(${produto.id})">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Carrinho de compras
function adicionarAoCarrinho(idProduto) {
    const configSalva = localStorage.getItem('loloModasConfig');
    const config = configSalva ? JSON.parse(configSalva) : CONFIG_PADRAO;
    const produto = config.produtos.find(p => p.id === idProduto);
    
    if (!produto) {
        mostrarToast('Produto não encontrado', 'error');
        return;
    }
    
    const itemExistente = estado.carrinho.find(item => item.id === idProduto);
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        const imagens = produto.imagens || [produto.imagem];
        estado.carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagem: imagens[0],
            quantidade: 1
        });
    }
    
    salvarEstado();
    mostrarToast(`"${produto.nome}" adicionado ao carrinho!`);
    atualizarContadores();
}

function abrirCarrinho() {
    atualizarCarrinho();
    document.getElementById('carrinhoModal').style.display = 'flex';
}

function atualizarCarrinho() {
    const carrinhoItens = document.getElementById('carrinhoItens');
    const carrinhoVazio = document.getElementById('carrinhoVazio');
    
    if (estado.carrinho.length === 0) {
        carrinhoItens.innerHTML = '';
        carrinhoVazio.style.display = 'block';
        return;
    }
    
    carrinhoVazio.style.display = 'none';
    
    carrinhoItens.innerHTML = estado.carrinho.map(item => {
        return `
            <div class="carrinho-item">
                <img src="${item.imagem}" alt="${item.nome}" class="carrinho-item-imagem"
                     onerror="this.src='https://via.placeholder.com/80x80/CCCCCC/666666?text=Produto'">
                <div class="carrinho-item-info">
                    <div class="carrinho-item-nome">${item.nome}</div>
                    <div class="carrinho-item-preco">R$ ${item.preco.toFixed(2)}</div>
                </div>
                <div class="carrinho-item-controles">
                    <button class="quantidade-btn" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                    <span class="quantidade-value">${item.quantidade}</span>
                    <button class="quantidade-btn" onclick="alterarQuantidade(${item.id}, 1)">+</button>
                    <button class="remover-item" onclick="removerDoCarrinho(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    atualizarContadores();
}

function alterarQuantidade(idProduto, alteracao) {
    const item = estado.carrinho.find(item => item.id === idProduto);
    
    if (item) {
        item.quantidade += alteracao;
        
        if (item.quantidade <= 0) {
            removerDoCarrinho(idProduto);
        } else {
            salvarEstado();
            atualizarCarrinho();
        }
    }
}

function removerDoCarrinho(idProduto) {
    estado.carrinho = estado.carrinho.filter(item => item.id !== idProduto);
    salvarEstado();
    atualizarCarrinho();
    mostrarToast('Produto removido do carrinho', 'warning');
}

// WhatsApp
function contatarWhatsapp(idProduto) {
    const configSalva = localStorage.getItem('loloModasConfig');
    const config = configSalva ? JSON.parse(configSalva) : CONFIG_PADRAO;
    const produto = config.produtos.find(p => p.id === idProduto);
    
    if (!produto) return;
    
    const telefone = config.textos?.telefone || '(11) 9999-9999';
    const nomeLoja = config.textos?.nomeLoja || 'Lolo Modas';
    
    const mensagem = `Olá! Gostaria de saber mais sobre: ${produto.nome} - R$ ${produto.preco.toFixed(2)} (${nomeLoja})`;
    const telefoneFormatado = telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
}

// Filtros
function filtrarCategoria(categoria) {
    estado.filtroAtivo = categoria;
    const produtos = document.querySelectorAll('.product-card');
    
    produtos.forEach(produto => {
        const catProduto = produto.dataset.categoria;
        let mostrar = false;
        
        if (categoria === 'todos') {
            mostrar = true;
        } else {
            mostrar = catProduto === categoria;
        }
        
        produto.style.display = mostrar ? 'block' : 'none';
    });
}

// Modal de detalhes
function verDetalhes(idProduto) {
    const configSalva = localStorage.getItem('loloModasConfig');
    const config = configSalva ? JSON.parse(configSalva) : CONFIG_PADRAO;
    const produto = config.produtos.find(p => p.id === idProduto);
    
    if (!produto) return;
    
    const imagens = produto.imagens || [produto.imagem];
    const modalContent = `
        <div style="padding: 30px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div>
                    <img src="${imagens[0]}" alt="${produto.nome}" style="width: 100%; border-radius: 10px;"
                         onerror="this.src='https://via.placeholder.com/400x300/CCCCCC/666666?text=Imagem+Indisponível'">
                </div>
                <div>
                    <h2 style="margin-bottom: 15px; color: var(--dark);">${produto.nome}</h2>
                    <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary); margin-bottom: 20px;">
                        R$ ${produto.preco.toFixed(2)}
                    </div>
                    <p style="margin-bottom: 20px; line-height: 1.6;">${produto.descricao || 'Produto de alta qualidade.'}</p>
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button class="add-to-cart" style="flex: 1;" onclick="adicionarAoCarrinho(${produto.id}); fecharModal()">
                            <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
                        </button>
                        <button class="whatsapp-btn" style="flex: 1;" onclick="contatarWhatsapp(${produto.id})">
                            <i class="fab fa-whatsapp"></i> Comprar pelo WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContent').innerHTML = modalContent;
    document.getElementById('productModal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('productModal').style.display = 'none';
}

// ===== FUNÇÕES PRINCIPAIS - PAINEL ADMIN =====

// Gerenciar produtos no painel
let imagensProdutoBase64 = [];

function previewMultipleImages(input) {
    const previewContainer = document.getElementById('multipleImagesPreview');
    const files = input.files;
    
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imagensProdutoBase64.push(e.target.result);
                
                const imgContainer = document.createElement('div');
                imgContainer.style.position = 'relative';
                imgContainer.style.display = 'inline-block';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'image-preview-thumb';
                img.alt = `Imagem ${imagensProdutoBase64.length}`;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '×';
                removeBtn.title = 'Remover imagem';
                removeBtn.onclick = function() {
                    const index = imagensProdutoBase64.indexOf(e.target.result);
                    if (index > -1) {
                        imagensProdutoBase64.splice(index, 1);
                    }
                    imgContainer.remove();
                    mostrarToast('Imagem removida do produto');
                };
                
                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                previewContainer.appendChild(imgContainer);
            }
            
            reader.readAsDataURL(file);
        }
        mostrarToast(`${files.length} imagem(ns) adicionada(s) ao produto`);
    }
}

function adicionarProduto() {
    const nome = document.getElementById('produtoNome').value;
    const preco = parseFloat(document.getElementById('produtoPreco').value);
    const categoria = document.getElementById('produtoCategoria').value;

    if (!nome || !preco || !categoria) {
        mostrarToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    if (imagensProdutoBase64.length === 0) {
        mostrarToast('Adicione pelo menos uma imagem para o produto', 'error');
        return;
    }

    const novoProduto = {
        id: Date.now(),
        nome: nome,
        preco: preco,
        categoria: categoria,
        imagens: [...imagensProdutoBase64]
    };

    const config = JSON.parse(localStorage.getItem('loloModasConfig')) || CONFIG_PADRAO;
    if (!config.produtos) config.produtos = [];

    config.produtos.push(novoProduto);
    localStorage.setItem('loloModasConfig', JSON.stringify(config));

    // Limpar formulário
    document.getElementById('formProduto').reset();
    document.getElementById('multipleImagesPreview').innerHTML = '';
    imagensProdutoBase64 = [];
    
    carregarListaProdutos();
    mostrarToast('Produto adicionado com sucesso!');
}

function carregarListaProdutos() {
    const container = document.getElementById('listaProdutos');
    const config = JSON.parse(localStorage.getItem('loloModasConfig')) || CONFIG_PADRAO;
    const produtos = config.produtos || [];

    if (produtos.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gray); grid-column: 1 / -1;">
                <i class="fas fa-shoe-prints" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>Nenhum produto cadastrado</h3>
                <p>Adicione seu primeiro produto usando o formulário acima.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = produtos.map(produto => {
        const imagemPrincipal = produto.imagens ? produto.imagens[0] : produto.imagem;
        const quantidadeImagens = produto.imagens ? produto.imagens.length : 1;

        return `
            <div class="product-card">
                <img src="${imagemPrincipal}" alt="${produto.nome}" 
                     onerror="this.src='https://via.placeholder.com/300x200/CCCCCC/666666?text=Imagem+Indisponível'">
                <h3>${produto.nome}</h3>
                <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}</p>
                <p><strong>Categoria:</strong> ${produto.categoria}</p>
                <p><strong>Imagens:</strong> ${quantidadeImagens}</p>
                <div class="product-actions">
                    <button class="btn btn-sm btn-danger" onclick="removerProduto(${produto.id})">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function removerProduto(id) {
    if (!confirm('Tem certeza que deseja remover este produto?')) {
        return;
    }

    const config = JSON.parse(localStorage.getItem('loloModasConfig')) || CONFIG_PADRAO;
    if (config.produtos) {
        config.produtos = config.produtos.filter(produto => produto.id !== id);
        localStorage.setItem('loloModasConfig', JSON.stringify(config));
        carregarListaProdutos();
        mostrarToast('Produto removido com sucesso!');
    }
}

// Personalização
function salvarPersonalizacao() {
    const config = JSON.parse(localStorage.getItem('loloModasConfig')) || CONFIG_PADRAO;

    config.textos = {
        nomeLoja: document.getElementById('configNomeLoja').value,
        descricao: document.getElementById('configDescricao').value,
        telefone: document.getElementById('configTelefone').value,
        email: document.getElementById('configEmail').value
    };

    config.cores = {
        primaria: document.getElementById('corPrimaria').value,
        secundaria: document.getElementById('corSecundaria').value,
        destaque: document.getElementById('corDestaque').value,
        texto: document.getElementById('corTexto').value,
        fundo: document.getElementById('corFundo').value
    };

    localStorage.setItem('loloModasConfig', JSON.stringify(config));
    mostrarToast('Personalização salva com sucesso!');
}

// Navegação do painel
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'produtos') {
        carregarListaProdutos();
    }
}

// ===== FUNÇÕES UTILITÁRIAS =====

// Toast notifications
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast ${tipo}`;
    toastMessage.textContent = mensagem;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Gerenciar estado
function salvarEstado() {
    localStorage.setItem('loloModasEstado', JSON.stringify({
        carrinho: estado.carrinho,
        favoritos: Array.from(estado.favoritos)
    }));
    atualizarContadores();
}

function carregarEstado() {
    const estadoSalvo = localStorage.getItem('loloModasEstado');
    if (estadoSalvo) {
        const data = JSON.parse(estadoSalvo);
        estado.carrinho = data.carrinho || [];
        estado.favoritos = new Set(data.favoritos || []);
    }
    atualizarContadores();
}

function atualizarContadores() {
    const totalItens = estado.carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    document.getElementById('carrinhoCount').textContent = totalItens;
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Iniciando Lolo Modas...');
    
    carregarEstado();
    carregarPersonalizacao();
    carregarProdutosPersonalizados();
    
    // Event listeners para modais
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
    
    document.getElementById('carrinhoModal').addEventListener('click', function(e) {
        if (e.target === this) document.getElementById('carrinhoModal').style.display = 'none';
    });
});