document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('multiStepForm');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');
    const progressFill = document.querySelector('.progress-fill');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    let currentStep = 0;

    // Máscaras para campos
    const cpfInput = document.getElementById('cpf');
    const phoneInput = document.getElementById('phone');
    const referencePhone1 = document.getElementById('reference_phone1');
    const referencePhone2 = document.getElementById('reference_phone2');
    const cepInput = document.getElementById('cep');

    // Aplicar máscaras
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = value;
        });
    }

    if (referencePhone1) {
        referencePhone1.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = value;
        });
    }

    if (referencePhone2) {
        referencePhone2.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = value;
        });
    }

    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
            
            // Buscar endereço automático quando CEP estiver completo
            if (value.length === 9) {
                fetchAddressByCEP(value.replace('-', ''));
            }
        });
    }

    // Função para buscar endereço pelo CEP
    function fetchAddressByCEP(cep) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('address').value = data.logradouro || '';
                    document.getElementById('neighborhood').value = data.bairro || '';
                    document.getElementById('city').value = data.localidade || '';
                    document.getElementById('state').value = data.uf || '';
                }
            })
            .catch(error => console.error('Erro ao buscar CEP:', error));
    }

    // Inicializa o formulário
    showStep(currentStep);

    // Event listeners para botões "Próximo"
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (validateStep(currentStep)) {
                currentStep++;
                updateProgressBar();
                showStep(currentStep);
            }
        });
    });

    // Event listeners para botões "Voltar"
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentStep--;
            updateProgressBar();
            showStep(currentStep);
        });
    });

    // Mostra o passo atual
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        // Esconde o botão "Voltar" no primeiro passo
        if (stepIndex === 0) {
            document.querySelector('.prev-btn').style.display = 'none';
        } else {
            document.querySelectorAll('.prev-btn').forEach(btn => {
                btn.style.display = 'block';
            });
        }

        // Muda o texto do último botão para "Enviar" no último passo
        if (stepIndex === steps.length - 1) {
            document.querySelector('.next-btn').style.display = 'none';
            document.querySelector('.submit-btn').style.display = 'block';
            updateSummary();
        } else {
            document.querySelector('.next-btn').style.display = 'block';
            document.querySelector('.submit-btn').style.display = 'none';
        }
    }

    // Atualiza a barra de progresso
    function updateProgressBar() {
        const progressPercent = (currentStep / (steps.length - 1)) * 100;
        progressFill.style.width = `${progressPercent}%`;

        progressSteps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Valida o passo atual antes de avançar
    function validateStep(stepIndex) {
        const currentStepInputs = steps[stepIndex].querySelectorAll('input[required], select[required]');
        let isValid = true;
    
        currentStepInputs.forEach(input => {
            if (!input.value.trim()) {
                markAsInvalid(input, 'Este campo é obrigatório');
                isValid = false;
            } else {
                markAsValid(input);
            }
    
            // Validação específica para email
            if (input.type === 'email' && !isValidEmail(input.value)) {
                markAsInvalid(input, 'Por favor, insira um e-mail válido');
                isValid = false;
            }
    
            // Validação para CPF
            if (input.id === 'cpf' && !validateCPF(input.value.replace(/\D/g, ''))) {
                markAsInvalid(input, 'CPF inválido');
                isValid = false;
            }
    
            // Validação para telefone
            if ((input.id === 'phone' || input.id === 'reference_phone1' || input.id === 'reference_phone2') && 
                input.value.replace(/\D/g, '').length < 10) {
                markAsInvalid(input, 'Telefone inválido');
                isValid = false;
            }
    
            // Validação para CEP
            if (input.id === 'cep' && input.value.replace(/\D/g, '').length < 8) {
                markAsInvalid(input, 'CEP inválido');
                isValid = false;
            }
    
            // Validação para dia de vencimento
            if (input.id === 'installment_date' && (input.value < 1 || input.value > 31)) {
                markAsInvalid(input, 'Dia inválido (1-31)');
                isValid = false;
            }
        });
    
        // Validação adicional para telefone de referência 1 não ser igual ao telefone principal
        if (stepIndex === 2) { // Passo 3 (índice 2)
            const phone = document.getElementById('phone').value.replace(/\D/g, '');
            const referencePhone1 = document.getElementById('reference_phone1').value.replace(/\D/g, '');
            
            if (phone && referencePhone1 && phone === referencePhone1) {
                const input = document.getElementById('reference_phone1');
                markAsInvalid(input, 'O telefone de referência não pode ser igual ao seu celular');
                isValid = false;
            }
        }
    
        return isValid;
    }

    // Marcar campo como inválido
    function markAsInvalid(input, message) {
        input.style.border = '1px solid #ff4444';
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Marcar campo como válido
    function markAsValid(input) {
        input.style.border = '';
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.style.display = 'none';
        }
    }

    // Valida formato de email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Valida CPF
    function validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11 || 
            cpf === "00000000000" || 
            cpf === "11111111111" || 
            cpf === "22222222222" || 
            cpf === "33333333333" || 
            cpf === "44444444444" || 
            cpf === "55555555555" || 
            cpf === "66666666666" || 
            cpf === "77777777777" || 
            cpf === "88888888888" || 
            cpf === "99999999999") {
            return false;
        }
        
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        
        if ((remainder === 10) || (remainder === 11)) {
            remainder = 0;
        }
        
        if (remainder !== parseInt(cpf.substring(9, 10))) {
            return false;
        }
        
        sum = 0;
        
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        
        if ((remainder === 10) || (remainder === 11)) {
            remainder = 0;
        }
        
        if (remainder !== parseInt(cpf.substring(10, 11))) {
            return false;
        }
        
        return true;
    }

    // Atualiza o resumo no último passo
    function updateSummary() {
        const summaryContent = document.getElementById('summaryContent');
        summaryContent.innerHTML = '';

        const fieldsToShow = [
            { id: 'fullname', label: 'Nome Completo' },
            { id: 'birthdate', label: 'Data de Nascimento' },
            { id: 'mothername', label: 'Nome da Mãe' },
            { id: 'cpf', label: 'CPF' },
            { id: 'email', label: 'E-mail' },
            { id: 'phone', label: 'Celular' },
            { id: 'socialmedia', label: 'Rede Social' },
            { id: 'cep', label: 'CEP' },
            { id: 'address', label: 'Endereço' },
            { id: 'number', label: 'Número' },
            { id: 'complement', label: 'Complemento' },
            { id: 'neighborhood', label: 'Bairro' },
            { id: 'city', label: 'Cidade' },
            { id: 'state', label: 'Estado' },
            { id: 'residence_type', label: 'Tipo de Residência' },
            { id: 'residence_time', label: 'Tempo de Residência' },
            { id: 'income_source', label: 'Fonte de Renda' },
            { id: 'reference_phone1', label: 'Telefone Ref. 1' },
            { id: 'reference_phone2', label: 'Telefone Ref. 2' },
            { id: 'installment_date', label: 'Dia de vencimento para demais parcelas' }
        ];

        fieldsToShow.forEach(field => {
            const input = document.getElementById(field.id);
            if (input && input.value) {
                const summaryItem = document.createElement('div');
                summaryItem.className = 'summary-item';
                
                const label = document.createElement('span');
                label.className = 'summary-label';
                label.textContent = field.label + ':';
                
                const value = document.createElement('span');
                value.className = 'summary-value';
                
                // Formata valores específicos
                if (field.id === 'birthdate' && input.value) {
                    const date = new Date(input.value);
                    value.textContent = date.toLocaleDateString('pt-BR');
                } else if (field.id === 'residence_type' && input.value) {
                    const options = {
                        'own': 'Própria',
                        'rented': 'Alugada',
                        'other': 'Outro'
                    };
                    value.textContent = options[input.value] || input.value;
                } else if (field.id === 'income_source' && input.value) {
                    const options = {
                        'salary': 'Salário',
                        'business': 'Negócio Próprio',
                        'pension': 'Pensão/Aposentadoria',
                        'freelancer': 'Freelancer/Autônomo',
                        'other': 'Outro'
                    };
                    value.textContent = options[input.value] || input.value;
                } else if (field.id === 'state' && input.value) {
                    value.textContent = getStateName(input.value);
                } else {
                    value.textContent = input.value;
                }
                
                summaryItem.appendChild(label);
                summaryItem.appendChild(value);
                summaryContent.appendChild(summaryItem);
            }
        });
    }

    // Retorna o nome completo do estado pela sigla
    function getStateName(uf) {
        const states = {
            'AC': 'Acre',
            'AL': 'Alagoas',
            'AP': 'Amapá',
            'AM': 'Amazonas',
            'BA': 'Bahia',
            'CE': 'Ceará',
            'DF': 'Distrito Federal',
            'ES': 'Espírito Santo',
            'GO': 'Goiás',
            'MA': 'Maranhão',
            'MT': 'Mato Grosso',
            'MS': 'Mato Grosso do Sul',
            'MG': 'Minas Gerais',
            'PA': 'Pará',
            'PB': 'Paraíba',
            'PR': 'Paraná',
            'PE': 'Pernambuco',
            'PI': 'Piauí',
            'RJ': 'Rio de Janeiro',
            'RN': 'Rio Grande do Norte',
            'RS': 'Rio Grande do Sul',
            'RO': 'Rondônia',
            'RR': 'Roraima',
            'SC': 'Santa Catarina',
            'SP': 'São Paulo',
            'SE': 'Sergipe',
            'TO': 'Tocantins'
        };
        return states[uf] || uf;
    }
    
    const vendedores = {
        monique: '5521985680490',
        hudson: '5598988888888',
        joao: '5598977777777'
        // Adicione mais vendedores conforme necessário
    };

    // Pega o nome do vendedor da URL
    const urlParams = new URLSearchParams(window.location.search);
    const vendedor = urlParams.get('vendedor');

    // Mostra o nome do vendedor no topo do formulário
    if (vendedor && vendedores[vendedor]) {
        const titleElement = document.querySelector('.form-header .title h1');
        if (titleElement) {
            const nomeFormatado = vendedor.charAt(0).toUpperCase() + vendedor.slice(1);
            titleElement.textContent += ` - Vendedor(a): ${nomeFormatado}`;
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Verifica se todos os campos obrigatórios estão preenchidos
        if (!validateStep(currentStep) || !document.getElementById('terms').checked) {
            alert('Preencha todos os campos obrigatórios e aceite os termos.');
            return;
        }

        // Verifica se o vendedor é válido
        if (!vendedor || !vendedores[vendedor]) {
            alert('Vendedor não identificado na URL. Use ?vendedor=nome (ex: monique, hudson, joao).');
            return;
        }

        // Coleta os dados do formulário
        const nome = document.getElementById('fullname').value;
        const cpf = document.getElementById('cpf').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const number = document.getElementById('number').value;
        const neighborhood = document.getElementById('neighborhood').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;

        // Cria a mensagem para o WhatsApp
        let mensagem = `*NOVO CADASTRO - Virtual Eletros*%0A%0A`;
        mensagem += `*👤 Nome:* ${nome}%0A`;
        mensagem += `*🧾 CPF:* ${cpf}%0A`;
        mensagem += `*📧 E-mail:* ${email}%0A`;
        mensagem += `*📱 Celular:* ${phone}%0A%0A`;
        mensagem += `*🏠 Endereço:*%0A`;
        mensagem += `${address}, ${number}%0A`;
        mensagem += `${neighborhood} - ${city}/${state}%0A%0A`;
        mensagem += `*👨‍💼 Vendedor:* ${vendedor.toUpperCase()}`;

        // Número do vendedor
        const numero = vendedores[vendedor];
        const urlWhatsapp = `https://wa.me/${numero}?text=${mensagem}`;

        // Abre o WhatsApp em uma nova aba
        window.open(urlWhatsapp, '_blank');
        
        // Opcional: Limpa o formulário após o envio
        // form.reset();
    });
});
// Controle da câmera
const video = document.getElementById('camera');
const canvas = document.getElementById('snapshot');
const photo = document.getElementById('photo');
const captureBtn = document.getElementById('captureBtn');

let stream = null;

if (video) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
            stream = s;
            video.srcObject = stream;
        })
        .catch(err => {
            console.error('Erro ao acessar a câmera:', err);
            alert('Erro ao acessar a câmera. Verifique as permissões.');
        });
}

if (captureBtn) {
    captureBtn.addEventListener('click', () => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas.toDataURL('image/png');
        photo.src = dataURL;
        photo.style.display = 'block';
        canvas.style.display = 'none';

        console.log('Imagem capturada:', dataURL);
    });
}
