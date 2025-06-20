// --- [script.js] - VERSÃO MELHORADA ---

// --- CONFIGURAÇÃO INICIAL ---
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let originX, originY;

// Função para ajustar o canvas ao tamanho da janela
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    originX = canvas.width / 2;
    originY = canvas.height / 2;
    particles = [];
}

window.addEventListener('resize', setupCanvas);

// --- CLASSE DO IMPULSO (AGORA COMO UMA LINHA ELÉTRICA) ---
class Impulse {
    constructor(x, y) {
        // Se a posição inicial for fornecida (para ramificações), use-a. Senão, use a origem.
        this.x = x || originX;
        this.y = y || originY;
        
        // Guarda o histórico de posições para desenhar a linha
        this.history = [{ x: this.x, y: this.y }];
        this.maxHistory = 20; // Comprimento da cauda do impulso
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.lifespan = Math.random() * 100 + 100; // Tempo de vida
        this.branchChance = 0.01; // 1% de chance de ramificar a cada frame
    }

    update() {
        this.lifespan--;

        // Movimento principal
        this.x += this.vx;
        this.y += this.vy;

        // Adiciona o "ruído" para um movimento irregular e elétrico
        this.vx += (Math.random() - 0.5) * 0.4;
        this.vy += (Math.random() - 0.5) * 0.4;

        // Adiciona a posição atual ao histórico
        this.history.push({ x: this.x, y: this.y });

        // Remove a posição mais antiga se o histórico estiver muito longo
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        // Lógica de Ramificação
        if (Math.random() < this.branchChance && this.lifespan > 50) {
            const branch = new Impulse(this.x, this.y);
            branch.lifespan = this.lifespan * 0.7; // A ramificação vive um pouco menos
            particles.push(branch);
        }
    }

    draw() {
        ctx.beginPath();
        // Começa a desenhar a linha a partir do ponto mais antigo do histórico
        ctx.moveTo(this.history[0].x, this.history[0].y);

        // Conecta todos os pontos do histórico para formar a linha
        for (let i = 1; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
        }

        // A opacidade da linha é baseada no tempo de vida do impulso
        const opacity = Math.max(0, this.lifespan / 200);
        ctx.strokeStyle = `rgba(46, 196, 182, ${opacity})`; // Verde Menta
        ctx.lineWidth = 1.5; // Espessura da linha
        ctx.stroke(); // Desenha a linha
    }
}

// --- LOOP DE ANIMAÇÃO ---
function animate() {
    // Usa um valor de alpha maior para que as caudas desapareçam mais rápido,
    // o que funciona melhor para o efeito de linha.
    ctx.fillStyle = 'rgba(13, 44, 84, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cria novos impulsos na origem se houver poucos na tela
    if (particles.length < 150) { // Um limite menor funciona bem com as ramificações
        particles.push(new Impulse());
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();

        if (p.lifespan <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

// --- INICIALIZAÇÃO ---
setupCanvas();
animate();