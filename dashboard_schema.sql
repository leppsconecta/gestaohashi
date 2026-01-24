-- Criação do Schema
CREATE SCHEMA IF NOT EXISTS gestaohashi;

-- Tabela de Reservas
CREATE TABLE IF NOT EXISTS gestaohashi.reservas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    tipo TEXT,
    nome TEXT NOT NULL,
    pax INTEGER,
    contato TEXT,
    origem TEXT,
    status TEXT CHECK (status IN ('Pendente', 'Confirmado', 'Cancelado', 'Finalizado')),
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Feedbacks
CREATE TABLE IF NOT EXISTS gestaohashi.feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE DEFAULT CURRENT_DATE,
    codigo TEXT,
    status TEXT CHECK (status IN ('Pendente', 'Resolvendo', 'Resolvido')),
    tipo TEXT CHECK (tipo IN ('Reclamação', 'Elogio', 'Sugestão', 'Denúncia')),
    origem TEXT CHECK (origem IN ('Site', 'Whatsapp', 'Google')),
    nome TEXT,
    contato TEXT,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Consumações
CREATE TABLE IF NOT EXISTS gestaohashi.consumacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE DEFAULT CURRENT_DATE,
    nome TEXT,
    codigo TEXT,
    tipo TEXT CHECK (tipo IN ('Sorteio', 'Cortesia', 'Voucher')),
    evento TEXT,
    status TEXT CHECK (status IN ('Pendente', 'Utilizado', 'Expirado')),
    validade DATE,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Promoções
CREATE TABLE IF NOT EXISTS gestaohashi.promocoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    categoria TEXT,
    descricao TEXT,
    ativa BOOLEAN DEFAULT TRUE,
    data_inicio DATE,
    data_fim DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Cupons
CREATE TABLE IF NOT EXISTS gestaohashi.cupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL,
    descricao TEXT,
    ativa BOOLEAN DEFAULT TRUE,
    validade DATE,
    desconto_valor DECIMAL(10,2),
    desconto_porcentagem INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) - Opcional: Ajuste para true se tiver autenticação configurada
ALTER TABLE gestaohashi.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestaohashi.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestaohashi.consumacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestaohashi.promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestaohashi.cupons ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (Permitir tudo para anon por enquanto para facilitar teste, REMOVA EM PRODUÇÃO se necessário)
CREATE POLICY "Acesso total publico reservas" ON gestaohashi.reservas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico feedbacks" ON gestaohashi.feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico consumacoes" ON gestaohashi.consumacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico promocoes" ON gestaohashi.promocoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico cupons" ON gestaohashi.cupons FOR ALL USING (true) WITH CHECK (true);

-- Dados de Exemplo para popular o dashboard
INSERT INTO gestaohashi.reservas (codigo, data, hora, tipo, nome, pax, contato, status) VALUES
('RES001', CURRENT_DATE, '19:00', 'Jantar', 'João Silva', 4, '11999999999', 'Pendente'),
('RES002', CURRENT_DATE, '20:00', 'Jantar', 'Maria Oliveira', 2, '11988888888', 'Pendente'),
('RES003', CURRENT_DATE + 1, '19:30', 'Jantar', 'Carlos Souza', 6, '11977777777', 'Confirmado');

INSERT INTO gestaohashi.feedbacks (data, codigo, status, tipo, origem, nome, descricao) VALUES
(CURRENT_DATE, 'FEB001', 'Pendente', 'Elogio', 'Site', 'Ana Pereira', 'Ótimo atendimento!'),
(CURRENT_DATE, 'FEB002', 'Pendente', 'Sugestão', 'Whatsapp', 'Bruno Lima', 'Poderiam ter mais opções veganas.'),
(CURRENT_DATE - 1, 'FEB003', 'Resolvido', 'Reclamação', 'Google', 'Teste', 'Demora no pedido.');

INSERT INTO gestaohashi.promocoes (titulo, ativa) VALUES
('Happy Hour', true),
('Festival de Sushi', true);

INSERT INTO gestaohashi.cupons (codigo, ativa) VALUES
('BEMVINDO10', true),
('HASHI2024', true);

-- Webhook Trigger para Feedbacks
-- Requer extensão pg_net: CREATE EXTENSION IF NOT EXISTS "pg_net";

CREATE OR REPLACE FUNCTION gestaohashi.trigger_webhook_feedback()
RETURNS TRIGGER AS $$
BEGIN
    -- Dispara webhook via pg_net (assíncrono)
    -- Verifica se o schema net existe antes de tentar chamar
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'net') THEN
        PERFORM net.http_post(
            url := 'https://webhook.leppsconecta.com.br/webhook/48e6571d-a594-4bac-977e-e29076e725cb',
            body := jsonb_build_object(
                'event', 'INSERT',
                'table', 'feedbacks',
                'record', row_to_json(NEW),
                'timestamp', NOW()
            ),
            headers := '{"Content-Type": "application/json"}'::jsonb
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS new_feedback_webhook ON gestaohashi.feedbacks;


CREATE TRIGGER new_feedback_webhook
AFTER INSERT ON gestaohashi.feedbacks
FOR EACH ROW
EXECUTE FUNCTION gestaohashi.trigger_webhook_feedback();

-- Webhook Trigger para Reservas
CREATE OR REPLACE FUNCTION gestaohashi.trigger_webhook_reserva()
RETURNS TRIGGER AS $$
BEGIN
    -- Dispara webhook via pg_net (assíncrono)
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'net') THEN
        PERFORM net.http_post(
            url := 'https://webhook.leppsconecta.com.br/webhook/3e277396-bd3f-445f-873c-b6b70c259272',
            body := jsonb_build_object(
                'event', 'INSERT',
                'table', 'reservas',
                'record', row_to_json(NEW),
                'timestamp', NOW()
            ),
            headers := '{"Content-Type": "application/json"}'::jsonb
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS new_reserva_webhook ON gestaohashi.reservas;

CREATE TRIGGER new_reserva_webhook
AFTER INSERT ON gestaohashi.reservas
FOR EACH ROW

-- Categoria Especial Updates
ALTER TABLE gestaohashi.categorias ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'padrao' CHECK (tipo IN ('padrao', 'especial'));

CREATE TABLE IF NOT EXISTS gestaohashi.destaques_conteudo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria_id UUID REFERENCES gestaohashi.categorias(id) ON DELETE CASCADE,
    titulo TEXT,
    descricao TEXT, -- Max 500 chars limit enforced in UI
    preco DECIMAL(10,2),
    midias JSONB DEFAULT '[]'::jsonb, -- Array of { url, type, duration }
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(categoria_id)
);

-- Policies for destaques (Open access for now matching others)
ALTER TABLE gestaohashi.destaques_conteudo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total publico destaques" ON gestaohashi.destaques_conteudo FOR ALL USING (true) WITH CHECK (true);
