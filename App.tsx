import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Home, Package, Wrench, AlertTriangle, CheckCircle, Plus, X, Menu, User, Zap, Cpu, Edit, Trash2, Building2, FileDown, UploadCloud, Database, ArrowDownCircle, Printer, Filter, Layers, HardDrive, MapPin, Target, FileOutput, Save, BarChart2, Truck, ArrowRightLeft, FileText, LogOut, LogIn, Search, AlertCircle, History, CalendarDays, Download, Upload, ChevronLeft, ChevronRight, Check, RefreshCcw, Clock, RefreshCw, ShieldAlert, Cloud, Lock, LayoutDashboard, PlusCircle, Settings, XCircle, MessageSquare, Camera, Send, Copy, FileCheck, CheckSquare, XSquare, ChevronDown, ChevronUp, ListTodo, Image as ImageIcon, Loader2, Smartphone, Eye, FileDigit, ClipboardCheck, Tag, Printer as PrinterIcon, Key, MonitorSmartphone, FileCode, MapPin as LocationIcon, FileBarChart, AlertOctagon } from 'lucide-react';

// ============================================================================
// 1. CONFIGURAÇÕES GERAIS
// ============================================================================

const LOGO_URL = "https://i.ibb.co/SDqxK8kF/logo-realmarka.png";
const LOGO_FALLBACK = "https://placehold.co/300x80/000/FFF?text=RMK1+ALMOX";
const ACCENT_COLOR = 'text-yellow-400';
const BG_DARK = 'bg-gray-900';
const TEXT_LIGHT = 'text-gray-100';
const LOCACAO_ESTOQUE_LOCAL = 'ESTOQUE LOCAL';
const SYSTEM_NAME = "RMK1 ALMOX";

const CATEGORIAS_PADRAO = ["Construção Civil", "Elétrica", "Hidráulica", "Pintura", "Ferramentas Manuais", "Máquinas Elétricas", "EPIs", "Ferragens", "Madeiras", "Serralheria", "Acabamento", "Outros"];
const AREAS_ESTOCAGEM = ['Almoxarifado', 'Conteiner', 'Estoque A', 'Estoque B', 'Estoque C'];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0].toUpperCase();
  }
  return Math.random().toString(16).slice(2, 10).toUpperCase();
};

const getLocalISOString = () => {
    const date = new Date();
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, -1);
};

const formatBRDate = (dateStr) => {
  if (!dateStr) return '-';
  if (typeof dateStr === 'object') {
      try { dateStr = dateStr.toISOString(); } catch(e) { return '-'; }
  }
  const parts = String(dateStr).split('T')[0].split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : String(dateStr);
};

const resizeImage = async (file, maxWidth = 800) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = String(event.target.result);
            img.onload = () => {
                const elem = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
                elem.width = width; elem.height = height;
                const ctx = elem.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(elem.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = () => reject(new Error("Erro ao renderizar imagem."));
        };
        reader.onerror = () => reject(new Error("Erro ao ler o ficheiro."));
    });
};

const DNA_TEMPLATES = {
  'Estruturais de Base e Concretagem': [
    { name: 'fck', label: 'Fck (Resistência)', placeholder: 'Ex: 25 MPa, 30 MPa' },
    { name: 'slump', label: 'Slump (Abatimento)', placeholder: 'Ex: 10 ± 2' },
    { name: 'lote_usina', label: 'Lote/Nota Fiscal da Usina', placeholder: 'Número de rastreio' },
    { name: 'hora_saida_chegada', label: 'Hora de Saída/Chegada', placeholder: 'Ex: 14:00 / 14:45' },
    { name: 'volume', label: 'Volume (m³)', type: 'number' }
  ],
  'Aço e Protensão': [
    { name: 'corrida_lote', label: 'Corrida / Lote', placeholder: 'Identificação da Usina' },
    { name: 'bitola', label: 'Bitola', placeholder: 'Ex: 16 DN, 10.0mm, 5.0mm' },
    { name: 'ca', label: 'CA (Categoria)', type: 'select', options: ['CA-50', 'CA-60'] },
    { name: 'certificado', label: 'Certificado de Qualidade', type: 'select', options: ['Sim', 'Não'] },
    { name: 'fabricante', label: 'Fabricante', placeholder: 'Ex: Gerdau, Arcelor' }
  ],
  'Cimentícios e Ensacados': [
    { name: 'lote_fabricacao', label: 'Lote de Fabricação' },
    { name: 'data_fabricacao', label: 'Data de Fabricação', type: 'date' },
    { name: 'validade_dna', label: 'Data de Validade', type: 'date' },
    { name: 'tipo_classe', label: 'Tipo/Classe', placeholder: 'Ex: CP-II, AC-III, Rejunte Flexível' }
  ],
  'Alvenaria e Revestimentos Cerâmicos': [
    { name: 'lote_referencia', label: 'Lote / Referência' },
    { name: 'tonalidade', label: 'Tonalidade' },
    { name: 'calibre_tamanho', label: 'Calibre/Tamanho', placeholder: 'Ex: 60x60, 20x20' },
    { name: 'resistencia', label: 'Resistência (PEI/Compressão)', placeholder: 'Ex: 7.0 MPa' }
  ],
  'Instalações (Elétrica, Gás, Hidráulica)': [
    { name: 'marca_modelo', label: 'Marca / Modelo' },
    { name: 'bitola_secao', label: 'Bitola / Seção', placeholder: 'Ex: 2,5mm², 25mm, 1/2"' },
    { name: 'norma', label: 'Selo INMETRO / Norma', placeholder: 'Ex: NBR 5410' },
    { name: 'tensao_pressao', label: 'Tensão / Pressão', placeholder: 'Ex: 750V, PN 10' }
  ],
  'Placas e Esquadrias': [
    { name: 'lote_producao', label: 'Lote de Produção' },
    { name: 'dimensoes', label: 'Dimensões', placeholder: 'L x A x Espessura' },
    { name: 'tipo_tratamento', label: 'Tipo de Tratamento', placeholder: 'Ex: Placa RU / Tratada' },
    { name: 'acabamento', label: 'Acabamento', placeholder: 'Ex: Alumínio Branco' }
  ],
  'Impermeabilização e Químicos': [
    { name: 'lote_quimico', label: 'Lote' },
    { name: 'validade_quimico', label: 'Data de Validade', type: 'date' },
    { name: 'cor', label: 'Cor / Código da Cor', placeholder: 'Ex: Branco Neve, R-105' },
    { name: 'demaos', label: 'Nº de Demãos Recomendadas', type: 'number' }
  ],
  'Reservatórios': [
    { name: 'capacidade', label: 'Capacidade (Litros)', type: 'number' },
    { name: 'material_reservatorio', label: 'Material', placeholder: 'Polietileno, Fibra, etc.' },
    { name: 'num_serie', label: 'Número de Série' }
  ]
};

// ============================================================================
// 2. CAMADA DE ACESSO AO BANCO DE DADOS (100% LOCAL - INDEXEDDB)
// ============================================================================

const COLLECTIONS = ['produtos', 'locacoes', 'ferramentas', 'emprestimos', 'movimentacoes_estoque', 'requisicoes', 'desperdicios'];
const DB_NAME = 'RMK_AlmoxarifadoDB_Local_V6';
const DB_VERSION = 1;

const AppDB = {
    db: null,
    init: () => {
        return new Promise((resolve, reject) => {
            if (AppDB.db) return resolve(true);
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                COLLECTIONS.forEach(collection => {
                    if (!db.objectStoreNames.contains(collection)) {
                        db.createObjectStore(collection, { keyPath: 'id' });
                    }
                });
            };

            request.onsuccess = (event) => {
                AppDB.db = event.target.result;
                resolve(true);
            };

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject(event.target.error);
            };
        });
    },
    getAll: async (collection) => {
        await AppDB.init();
        return new Promise((resolve, reject) => {
            const transaction = AppDB.db.transaction([collection], 'readonly');
            const store = transaction.objectStore(collection);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },
    get: async (collection, id) => {
        await AppDB.init();
        return new Promise((resolve, reject) => {
            const transaction = AppDB.db.transaction([collection], 'readonly');
            const store = transaction.objectStore(collection);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    put: async (collection, item) => {
        await AppDB.init();
        return new Promise((resolve, reject) => {
            const transaction = AppDB.db.transaction([collection], 'readwrite');
            const store = transaction.objectStore(collection);
            const request = store.put(item);
            request.onsuccess = () => resolve(item);
            request.onerror = () => reject(request.error);
        });
    },
    delete: async (collection, id) => {
        await AppDB.init();
        return new Promise((resolve, reject) => {
            const transaction = AppDB.db.transaction([collection], 'readwrite');
            const store = transaction.objectStore(collection);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    clearAll: async (collection) => {
        await AppDB.init();
        return new Promise((resolve, reject) => {
            const transaction = AppDB.db.transaction([collection], 'readwrite');
            const store = transaction.objectStore(collection);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};

// ============================================================================
// 3. UTILITÁRIOS E PDF
// ============================================================================

const printLowStockReport = (produtos, category = 'ALL', showMsg) => {
    let lowStock = (produtos || []).filter(i => (Number(i.saldo_atual) || 0) < (Number(i.estoque_minimo) || 5) && String(i.ativo) !== 'false');
    if (category !== 'ALL') lowStock = lowStock.filter(i => (i.categoria || 'Geral') === category);

    if (lowStock.length === 0) {
        if(showMsg) showMsg("Aviso", category === 'ALL' ? "Nenhum item com estoque abaixo do mínimo." : `Não há itens com estoque baixo em "${category}".`);
        return;
    }

    const grouped = lowStock.reduce((acc, item) => {
        const cat = item.categoria || 'Geral';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const printWindow = window.open('', '', 'height=800,width=900');
    if (!printWindow) {
        if(showMsg) showMsg("Atenção", "Permita popups para imprimir.");
        return;
    }

    const reportTitle = category === 'ALL' ? 'ITENS COM ESTOQUE BAIXO POR CATEGORIA' : `ESTOQUE BAIXO: ${category.toUpperCase()}`;

    let html = `<html><head><title>Relatório de Estoque Baixo</title>
    <style>
      body { font-family: Arial, sans-serif; }
      .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
      .header img { max-height: 40px; filter: grayscale(100%) contrast(200%); }
      h1 { text-align: center; font-size: 18px; text-transform: uppercase; flex-grow: 1;}
      h2 { border-bottom: 1px solid #ccc; font-size: 14px; background: #f0f0f0; padding: 6px; text-transform: uppercase; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 12px; }
      th { background-color: #e0e0e0; font-weight: bold; text-align: center; }
      .center { text-align: center; }
      .danger { color: red; font-weight: bold; }
    </style></head><body>
    <div class="header"><img src="${LOGO_URL}" alt="${SYSTEM_NAME}"><h1>${reportTitle}</h1><div>Data:<br>${new Date().toLocaleDateString('pt-BR')}</div></div>`;

    Object.keys(grouped).sort().forEach(cat => {
        if (category === 'ALL') html += `<h2>Categoria: ${String(cat)}</h2>`;
        html += `<table><thead><tr><th style="width: 40%;">Descrição do Item</th><th style="width: 15%;">Empreiteira</th><th style="width: 15%;">Localização</th><th style="width: 15%;">Estoque Mínimo</th><th style="width: 15%;">Saldo Atual</th></tr></thead><tbody>`;
        grouped[cat].sort((a,b) => String(a.nome).localeCompare(String(b.nome))).forEach(item => {
            const localizacao = item.rua && item.prateleira ? `R${item.rua}-P${item.prateleira}` : (item.local_armazenamento || '-');
            html += `<tr><td>${String(item.nome)} <small>(${String(item.unidade)})</small></td><td class="center">${String(item.empreiteira || '-')}</td><td class="center">${localizacao}</td><td class="center">${item.estoque_minimo}</td><td class="center danger">${item.saldo_atual}</td></tr>`;
        });
        html += `</tbody></table>`;
    });
    html += `</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
};

const printBulkLabels = (items, showMsg) => {
    if(!items || items.length === 0) return;
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) {
        if(showMsg) showMsg("Atenção", "Permita popups para imprimir etiquetas.");
        return;
    }

    let html = `<html><head><title>Etiquetas de Lote - A4</title>
    <style>
      @page { size: A4 portrait; margin: 10mm; }
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #fff; color: #000; }
      .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; width: 190mm; margin: 0 auto; padding-top: 5mm; }
      .label-box { border: 2px solid #000; padding: 4mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border-radius: 4px; overflow: hidden; height: 50mm; page-break-inside: avoid; }
      .title { font-size: 14px; font-weight: 900; text-align: center; border-b: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 3px; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
      .bold { font-weight: bold; }
      .barcode-container { text-align: center; margin-top: auto; }
      .barcode-text { font-size: 16px; font-family: monospace; letter-spacing: 2px; font-weight: bold;}
      .footer { font-size: 8px; text-align: center; color: #555; margin-top: 2px; border-top: 1px dashed #ccc; padding-top: 2px;}
    </style></head><body>
    <div class="grid-container">`;

    items.forEach(item => {
        const validadeFormatada = item.dna_payload?.validade_dna || item.dna_payload?.validade_quimico || item.validade;
        const localizacao = item.rua && item.prateleira ? `R${item.rua}-P${item.prateleira}` : '-';
        html += `
           <div class="label-box">
               <div class="title">${String(item.nome)}</div>
               <div class="row"><span class="bold">Lote: <span style="font-weight:normal">${String(item.lote || item.dna_payload?.lote_fabricacao || item.dna_payload?.lote_usina || 'N/A')}</span></span> <span class="bold">Val: <span style="font-weight:normal">${formatBRDate(validadeFormatada)}</span></span></div>
               <div class="row"><span class="bold">Fornecedor/NF: <span style="font-weight:normal">${String(item.fornecedor_nf || 'N/A')}</span></span> <span class="bold">Qtd: <span style="font-weight:normal">${Number(item.saldo_atual)} ${String(item.unidade)}</span></span></div>
               <div class="row"><span class="bold">Local: <span style="font-weight:normal">${localizacao}</span></span> <span class="bold">DNA: <span style="font-weight:normal; font-size: 9px;">${String(item.dna_type || 'Geral')}</span></span></div>
               <div class="barcode-container"><div class="barcode-text">*${String(item.sku)}*</div></div>
               <div class="footer">${SYSTEM_NAME} - ${String(item.empreiteira || 'Geral')}</div>
           </div>
        `;
    });

    html += `</div></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
};

const printDesperdiciosReport = (desperdicios, produtos, empreiteira = 'ALL', showMsg) => {
    let list = desperdicios || [];
    if (empreiteira !== 'ALL') list = list.filter(d => d.empreiteira === empreiteira);

    if (list.length === 0) {
        if(showMsg) showMsg("Aviso", "Nenhum desperdício encontrado para os filtros atuais.");
        return;
    }

    const printWindow = window.open('', '', 'height=800,width=900');
    if (!printWindow) {
        if(showMsg) showMsg("Atenção", "Permita popups para imprimir.");
        return;
    }

    const grouped = list.reduce((acc, item) => {
        const emp = item.empreiteira || 'Geral';
        if (!acc[emp]) acc[emp] = { items: [], total: 0 };
        acc[emp].items.push(item);
        acc[emp].total += Number(item.valor_total || 0);
        return acc;
    }, {});

    let html = `<html><head><title>Relatório de Desperdício e Perdas</title>
    <style>
      body { font-family: Arial, sans-serif; }
      .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
      .header img { max-height: 40px; filter: grayscale(100%) contrast(200%); }
      h1 { text-align: center; font-size: 18px; text-transform: uppercase; flex-grow: 1;}
      h2 { border-bottom: 1px solid #ccc; font-size: 14px; background: #f0f0f0; padding: 6px; text-transform: uppercase; margin-top: 30px; display: flex; justify-content: space-between;}
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 11px; vertical-align: middle; }
      th { background-color: #e0e0e0; font-weight: bold; text-align: center; }
      .center { text-align: center; }
      .thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; }
      .val { color: #b91c1c; font-weight: bold; }
    </style></head><body>
    <div class="header"><img src="${LOGO_URL}" alt="${SYSTEM_NAME}"><h1>RELATÓRIO DE DESPERDÍCIO E PERDAS (ISO 9001)</h1><div>Data:<br>${new Date().toLocaleDateString('pt-BR')}</div></div>`;

    let grandTotal = 0;

    Object.keys(grouped).sort().forEach(emp => {
        grandTotal += grouped[emp].total;
        html += `<h2><span>Empreiteira/Centro de Custo: ${String(emp)}</span> <span>Custo Total Perda: R$ ${grouped[emp].total.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></h2>`;
        html += `<table><thead><tr><th style="width: 80px;">Evidência</th><th>Produto / Insumo</th><th>Local Encontrado</th><th>Estado/Motivo</th><th style="width: 60px;">Qtd</th><th style="width: 80px;">Custo (R$)</th></tr></thead><tbody>`;
        grouped[emp].items.sort((a,b) => new DateApp.jsx(b.data) - new Date(a.data)).forEach(item => {
            const prod = produtos.find(p => p.id === item.produto_id) || { nome: 'Produto Excluído', unidade: 'UN' };
            const imgHtml = item.foto_url ? `<img src="${item.foto_url}" class="thumb" />` : 'S/ Foto';
            html += `<tr>
                <td class="center">${imgHtml}</td>
                <td><strong>${prod.nome}</strong><br><span style="font-size: 9px; color: #555;">Data Registo: ${formatBRDate(item.data)}</span></td>
                <td>${item.local_encontrado}</td>
                <td>${item.estado}<br><span style="font-size: 9px; font-style: italic;">${item.obs||''}</span></td>
                <td class="center font-bold">${item.qtd} ${prod.unidade}</td>
                <td class="center val">R$ ${Number(item.valor_total).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
            </tr>`;
        });
        html += `</tbody></table>`;
    });

    html += `<div style="margin-top: 30px; text-align: right; font-size: 16px; border-top: 2px solid #000; padding-top: 10px;">
        <strong>CUSTO GLOBAL DE DESPERDÍCIO (FILTRO ATUAL): <span style="color: red;">R$ ${grandTotal.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></strong>
    </div>`;

    html += `</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 800);
};

// ============================================================================
// 4. XML PARSER - LEITURA NATIVA DE NOTAS FISCAIS ELETRÔNICAS (NFC-e/NF-e)
// ============================================================================

const parseXMLNFe = async (file) => {
    try {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) throw new Error('Arquivo XML inválido ou mal formatado.');

        const getTextContent = (parent, tagName) => {
            const element = parent?.getElementsByTagName(tagName)?.[0];
            return element?.textContent || '';
        };

        const infNFe = xmlDoc.getElementsByTagName('infNFe')[0] || xmlDoc.getElementsByTagName('NFe')[0];
        if (!infNFe) throw new Error('Não foi possível encontrar dados de NF-e no arquivo.');

        const ide = infNFe.getElementsByTagName('ide')[0];
        const emit = infNFe.getElementsByTagName('emit')[0];
        const dest = infNFe.getElementsByTagName('dest')[0];
        const detList = infNFe.getElementsByTagName('det');

        const numeroNF = getTextContent(ide, 'nNF');
        const serie = getTextContent(ide, 'serie');
        const dataEmissao = getTextContent(ide, 'dhEmi') || getTextContent(ide, 'dEmi');
        const chaveAcesso = infNFe.getAttribute('Id')?.replace('NFe', '') || '';

        const razaoEmitente = getTextContent(emit, 'xNome');
        const cnpjEmitente = getTextContent(emit, 'CNPJ');

        const produtos = [];
        for (let i = 0; i < detList.length; i++) {
            const det = detList[i];
            const prod = det.getElementsByTagName('prod')[0];
            const item = {
                codigo: getTextContent(prod, 'cProd'),
                descricao: getTextContent(prod, 'xProd'),
                ncm: getTextContent(prod, 'NCM'),
                cfop: getTextContent(prod, 'CFOP'),
                unidade: getTextContent(prod, 'uCom'),
                qtd: parseFloat(getTextContent(prod, 'qCom') || '1'),
                valorUnitario: parseFloat(getTextContent(prod, 'vUnCom') || '0'),
                valorTotal: parseFloat(getTextContent(prod, 'vProd') || '0'),
            };
            produtos.push(item);
        }

        const total = infNFe.getElementsByTagName('total')[0];
        const icmsTot = total?.getElementsByTagName('ICMSTot')[0];
        const valorTotalNF = getTextContent(icmsTot, 'vNF');

        return {
            success: true,
            tipo: 'NFe',
            numeroNF,
            serie,
            dataEmissao,
            chaveAcesso,
            emitente: { razao: razaoEmitente, cnpj: cnpjEmitente },
            destinatario: { razao: getTextContent(dest, 'xNome'), cnpj: getTextContent(dest, 'CNPJ') || getTextContent(dest, 'CPF') },
            produtos,
            valorTotal: valorTotalNF,
            raw: { xmlDoc, infNFe }
        };
    } catch (error) {
        console.error('Erro ao parsear XML:', error);
        throw new Error(`Erro ao ler arquivo XML: ${error.message}`);
    }
};

// ============================================================================
// 5. COMPONENTES VISUAIS REUTILIZÁVEIS E MODAL DE ALERTAS
// ============================================================================

const DialogModal = ({ title, message, isConfirm, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          {isConfirm ? <AlertTriangle className="text-yellow-500"/> : <AlertCircle className="text-blue-500"/>}
          {title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="bg-gray-950 px-6 py-4 flex justify-end gap-3 border-t border-gray-800">
        {isConfirm && <button onClick={onCancel} className="px-4 py-2 rounded-lg font-bold text-gray-400 hover:bg-gray-800 transition">Cancelar</button>}
        <button onClick={onConfirm} className="px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition">OK</button>
      </div>
    </div>
  </div>
);

const Spinner = () => <div className="flex items-center justify-center p-2"><Cpu className={`w-5 h-5 animate-spin ${ACCENT_COLOR}`} /><span className={`${TEXT_LIGHT} ml-2 text-sm font-bold`}>Processando...</span></div>;

const Card = ({ children, title, icon: Icon, className = "", onClick = undefined }) => (
  <div className={`p-4 md:p-6 rounded-xl shadow-lg ${BG_DARK} ${TEXT_LIGHT} border border-yellow-800/50 ${className} print:border-none print:shadow-none print:bg-white print:text-black print:p-0 transition-all ${onClick ? 'cursor-pointer hover:border-yellow-500' : ''}`} onClick={onClick}>
    {title && <h2 className={`text-xl font-bold mb-4 ${ACCENT_COLOR} print:text-black print:text-2xl print:border-b print:border-black print:pb-2 flex items-center gap-2`}>{Icon && <Icon className="w-5 h-5"/>} {String(title)}</h2>}
    {children}
  </div>
);

const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-yellow-500 text-gray-900 hover:bg-yellow-600 shadow-yellow-500/30",
    secondary: "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-red-500/20",
    outline: "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
  };
  return (
    <button {...props} className={`px-4 py-2 rounded-lg font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg print:hidden ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, className = "", list, ...props }) => (
  <div className={`w-full ${className}`}>
      {label && <label className="block text-xs font-medium text-gray-400 mb-1">{String(label)} {props.required && <span className="text-yellow-500">*</span>}</label>}
      <input {...props} list={list} className="w-full p-2 rounded-lg bg-gray-900 text-gray-100 border border-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors print:hidden disabled:opacity-50 outline-none" />
  </div>
);

const Select = ({ label, className = "", options = [], description, ...props }) => (
  <div className={`w-full ${className}`}>
      {label && <label className="block text-xs font-medium text-gray-400 mb-1">{String(label)} {props.required && <span className="text-yellow-500">*</span>}</label>}
      <select {...props} className="w-full p-2 rounded-lg bg-gray-900 text-gray-100 border border-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors print:hidden disabled:opacity-50 outline-none">
        {props.children}
        {options.length > 0 && options.map((opt, idx) => (
           <option key={idx} value={opt?.value ?? opt}>{String(opt?.label ?? opt)}</option>
        ))}
      </select>
      {description && <p className="mt-1.5 text-[11px] text-zinc-500 leading-tight italic">{String(description)}</p>}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Rascunho': 'bg-zinc-800 text-yellow-500 border-zinc-700',
    'Aprovado': 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50',
    'Reprovado': 'bg-red-950/30 text-red-400 border-red-900/50'
  };
  const Icons = { 'Rascunho': Clock, 'Aprovado': CheckCircle, 'Reprovado': XCircle };
  const IconComponent = Icons[status] || Clock;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit ${styles[status] || styles['Rascunho']}`}>
      <IconComponent size={14} /> {String(status)}
    </span>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Erro capturado na interface:", error, errorInfo); }
  
  handleEmergencyBackup = () => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onsuccess = (e) => {
          const db = e.target.result;
          const exportData = {};
          let completed = 0;
          
          COLLECTIONS.forEach(col => {
              if(db.objectStoreNames.contains(col)){
                  const tx = db.transaction(col, 'readonly');
                  const store = tx.objectStore(col);
                  const allReq = store.getAll();
                  allReq.onsuccess = () => {
                      exportData[col] = allReq.result;
                      completed++;
                      if(completed === COLLECTIONS.length) {
                          const blob = new Blob([JSON.stringify(exportData)], {type: 'application/json'});
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = `EMERGENCIA_RMK_${new Date().getTime()}.json`;
                          a.click();
                      }
                  }
                  allReq.onerror = () => { completed++; }
              } else { completed++; }
          });
      };
      req.onerror = () => alert("Falha ao abrir base de dados local para resgate.");
  }

  render() {
      if (this.state.hasError) {
          return (
              <div className="p-8 text-center text-white bg-red-950 min-h-screen flex flex-col items-center justify-center">
                  <AlertTriangle className="w-20 h-20 text-red-500 mb-4 animate-bounce" />
                  <h1 className="text-3xl font-black text-red-400 mb-2">Escudo de Segurança Ativado</h1>
                  <p className="text-red-200 mb-8 max-w-md">O sistema interceptou uma falha crítica na interface para proteger os seus dados. Pode exportar toda a base de dados agora mesmo de forma segura.</p>
                  <button onClick={this.handleEmergencyBackup} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl flex items-center gap-3 shadow-2xl mb-8 border border-blue-400 transition-all">
                      <Download size={24} /> Exportar Dados de Emergência
                  </button>
                  <button onClick={() => window.location.reload()} className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">Recarregar Sistema</button>
                  <div className="mt-10 p-4 bg-black/50 rounded-lg text-left max-w-2xl w-full border border-red-900/50">
                      <p className="text-xs text-red-400 font-mono overflow-auto">{String(this.state.error?.message || 'Erro Desconhecido')}</p>
                  </div>
              </div>
          );
      }
      return this.props.children;
  }
}

const DateRangeFilter = ({ startDate, setStartDate, endDate, setEndDate, onClear }) => (
  <div className="flex flex-col sm:flex-row items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700 w-full md:w-auto print:hidden">
    <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-yellow-500" /><span className="text-sm text-gray-400 font-medium">Filtrar Data:</span></div>
    <div className="flex items-center gap-2">
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-gray-900 text-gray-100 text-xs px-2 py-1 rounded border border-gray-700 outline-none" />
      <span className="text-gray-500">até</span>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-gray-900 text-gray-100 text-xs px-2 py-1 rounded border border-gray-700 outline-none" />
    </div>
    {startDate && endDate && <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300"><XCircle size={16} /></button>}
  </div>
);

// ============================================================================
// 6. COMPONENTES DE LEITURA (XML NATIVO)
// ============================================================================

const XMLImportModal = ({ isOpen, onClose, onDataExtracted, showMsg }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [extractedData, setExtractedData] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.toLowerCase().endsWith('.xml')) {
                showMsg('Aviso', 'Por favor, selecione apenas arquivos XML da NF-e.');
                return;
            }
            setFile(selectedFile);
            setExtractedData(null);
            setSelectedProducts([]);
        }
    };

    const handleProcessFile = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const data = await parseXMLNFe(file);
            setExtractedData({
                numeroNF: data.numeroNF,
                dataEmissao: data.dataEmissao,
                emitente: { razao: data.emitente.razao },
                produtos: data.produtos.map(i => ({
                    codigo: i.codigo || '', descricao: i.descricao, unidade: i.unidade || 'UN', qtd: i.qtd, valorUnitario: i.valorUnitario || 0,
                    categoria: CATEGORIAS_PADRAO[0], rastreavel: false, lote: '', validade: '', dna_type: ''
                }))
            });
            setSelectedProducts(data.produtos.map((_, idx) => idx));
        } catch (error) {
            showMsg('Erro no XML', error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleProduct = (idx) => setSelectedProducts(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    const selectAllProducts = () => { if (extractedData) setSelectedProducts(extractedData.produtos.map((_, idx) => idx)); };
    const deselectAllProducts = () => { setSelectedProducts([]); };

    const handleConfirm = () => {
        if (!extractedData || selectedProducts.length === 0) { showMsg('Aviso', 'Selecione pelo menos um produto para importar.'); return; }
        const selectedItems = selectedProducts.map(idx => extractedData.produtos[idx]);
        onDataExtracted({
            xmlData: extractedData,
            selectedProducts: selectedItems,
            fornecedor: extractedData.emitente.razao,
            numeroNF: extractedData.numeroNF,
            dataEmissao: extractedData.dataEmissao
        });
        onClose(); setFile(null); setExtractedData(null); setSelectedProducts([]); if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card title="Importação Nativa de XML (NF-e)" className="max-w-4xl w-full bg-gray-900 border-gray-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={24}/></button>
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-blue-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-800/50">
                        <input ref={fileInputRef} type="file" accept=".xml" onChange={handleFileChange} className="hidden" id="xml-upload" />
                        <label htmlFor="xml-upload" className="cursor-pointer flex flex-col items-center">
                            <FileCode className="w-12 h-12 text-blue-500 mb-3" />
                            <p className="text-gray-300 text-sm font-bold">{file ? file.name : 'Clique para selecionar o XML da Nota Fiscal'}</p>
                            <p className="text-gray-500 text-xs mt-1">Processamento 100% local e seguro via DOMParser nativo.</p>
                        </label>
                    </div>

                    {file && !extractedData && (
                        <Button onClick={handleProcessFile} className="w-full !bg-blue-600 !text-white" disabled={loading}>
                            {loading ? <Spinner /> : <><FileDigit className="w-4 h-4 mr-2"/> Ler XML Imediatamente</>}
                        </Button>
                    )}

                    {extractedData && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2"><FileText size={18}/> Dados da Nota Fiscal</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-gray-400">Número NF-e:</span> <span className="text-white ml-2 font-mono">{extractedData.numeroNF || '-'}</span></div>
                                    <div><span className="text-gray-400">Emissão:</span> <span className="text-white ml-2">{formatBRDate(extractedData.dataEmissao)}</span></div>
                                    <div className="sm:col-span-2"><span className="text-gray-400">Fornecedor:</span> <span className="text-white ml-2">{extractedData.emitente.razao}</span></div>
                                </div>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-blue-400 font-bold flex items-center gap-2"><Package size={18}/> Produtos Encontrados ({extractedData.produtos.length})</h3>
                                    <div className="flex gap-2">
                                        <button onClick={selectAllProducts} className="text-xs text-blue-400 hover:text-blue-300">Selecionar todos</button><span className="text-gray-600">|</span>
                                        <button onClick={deselectAllProducts} className="text-xs text-red-400 hover:text-red-300">Limpar seleção</button>
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                    {extractedData.produtos.map((prod, idx) => (
                                        <div key={idx} onClick={() => toggleProduct(idx)} className={`p-3 rounded border cursor-pointer transition-all ${selectedProducts.includes(idx) ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${selectedProducts.includes(idx) ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                                                    {selectedProducts.includes(idx) && <Check size={14} className="text-gray-900"/>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium text-sm truncate">{prod.descricao}</p>
                                                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-1">
                                                        {prod.codigo && <span>Cód: {prod.codigo}</span>}
                                                        <span className="font-bold text-yellow-400">Qtd: {prod.qtd} {prod.unidade}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                                <Button onClick={handleConfirm} className="flex-1 !bg-blue-600"><CheckCircle size={16} className="mr-2"/> Importar {selectedProducts.length} itens</Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

// ============================================================================
// 7. VIEWS PRINCIPAIS
// ============================================================================

const DashboardView = ({ produtos, locacoes, ferramentas, emprestimos, movimentacoes, desperdicios, setActiveTab }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportConfig, setReportConfig] = useState({ kpi: true, critico: true, controlados: false, auditoria: false });

  const formatNumber = (num) => Number(num).toLocaleString('pt-BR');
  const produtosAtivos = (produtos || []).filter(p => String(p.ativo) !== 'false');
  const estoqueBaixo = produtosAtivos.filter(p => (Number(p.saldo_atual) || 0) < (Number(p.estoque_minimo) || 5));
  
  const ferramentasAtivas = (ferramentas || []).filter(f => String(f.ativo) !== 'false');
  const ferramentasEmUso = ferramentasAtivas.filter(f => f.status === 'EMPRESTADO');
  
  const locacoesAtivas = (locacoes || []).filter(l => String(l.ativo) !== 'false' && l.status !== 'DEVOLUCAO');

  const estoquePorEmpreiteira = produtosAtivos.reduce((acc, p) => {
    if(p.empreiteira) {
      acc[p.empreiteira] = (acc[p.empreiteira] || 0) + 1;
    }
    return acc;
  }, {});

  const handleGeneratePDF = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return;

    let html = `<html><head><title>Relatório Gerencial ISO 9001 - ${SYSTEM_NAME}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
      .header img { max-height: 50px; }
      h1 { font-size: 20px; text-transform: uppercase; margin: 0; }
      h2 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
      .grid { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
      .box { border: 1px solid #000; padding: 15px; width: 45%; box-sizing: border-box; text-align: center; }
      .box .title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #666; }
      .box .value { font-size: 24px; font-weight: bold; margin-top: 5px; color: #000; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
      th, td { border: 1px solid #000; padding: 6px; text-align: left; }
      th { background-color: #f0f0f0; }
      .signatures { margin-top: 60px; display: flex; justify-content: space-around; }
      .sig-line { width: 40%; border-top: 1px solid #000; text-align: center; padding-top: 5px; font-weight: bold; font-size: 12px; }
    </style></head><body>
    <div class="header">
      <img src="${LOGO_URL}" alt="${SYSTEM_NAME}">
      <div>
        <h1>Relatório de Status Geral</h1>
        <div style="font-size: 12px;">Conformidade PBQP-H / ISO 9001</div>
      </div>
      <div style="text-align: right; font-size: 12px;">
        Data: ${new Date().toLocaleDateString('pt-BR')}<br>
        Hora: ${new Date().toLocaleTimeString('pt-BR')}
      </div>
    </div>`;
    
    if (reportConfig.kpi) {
        html += `<h2>1. Indicadores de Desempenho (KPIs)</h2>
        <div class="grid">
          <div class="box"><div class="title">Itens em Estoque Controlado</div><div class="value">${produtosAtivos.length}</div></div>
          <div class="box"><div class="title">Alerta de Estoque Baixo</div><div class="value" style="color: red;">${estoqueBaixo.length}</div></div>
          <div class="box"><div class="title">Maquinário Externo (Locações)</div><div class="value">${locacoesAtivas.length}</div></div>
          <div class="box"><div class="title">Ferramentas em Uso (Campo)</div><div class="value">${ferramentasEmUso.length} / ${ferramentasAtivas.length}</div></div>
        </div>`;
    }

    if (reportConfig.critico) {
        html += `<h2>2. Síntese de Estoque Crítico (Abaixo do Mínimo)</h2>`;
        if (estoqueBaixo.length === 0) {
            html += `<p>Nenhum item com estoque abaixo do mínimo registrado.</p>`;
        } else {
            html += `<table><thead><tr><th>Insumo</th><th>Categoria</th><th>Empreiteira</th><th>Estoque Mín.</th><th>Saldo Físico</th></tr></thead><tbody>`;
            estoqueBaixo.slice(0, 30).forEach(p => {
                html += `<tr><td>${p.nome}</td><td>${p.categoria}</td><td>${p.empreiteira||'-'}</td><td style="text-align:center;">${p.estoque_minimo}</td><td style="text-align:center; font-weight:bold; color:red;">${p.saldo_atual}</td></tr>`;
            });
            html += `</tbody></table>`;
            if(estoqueBaixo.length > 30) html += `<p style="font-size: 10px; color: #666;">Exibindo os primeiros 30 de ${estoqueBaixo.length} itens críticos.</p>`;
        }
    }

    if (reportConfig.controlados) {
        const controlados = produtosAtivos.filter(p => !!p.rastreavel);
        html += `<h2>3. Insumos Controlados (Matriz PBQP-H)</h2>`;
        if (controlados.length === 0) {
            html += `<p>Nenhum insumo rastreável registrado no momento.</p>`;
        } else {
            html += `<table><thead><tr><th>Material</th><th>Tipo de DNA</th><th>Lote/NF</th><th>Validade Base</th><th>Saldo Físico</th></tr></thead><tbody>`;
            controlados.slice(0, 30).forEach(p => {
                html += `<tr><td>${p.nome}</td><td>${p.dna_type||'Geral'}</td><td>${p.lote||p.fornecedor_nf||'-'}</td><td>${formatBRDate(p.validade)}</td><td style="text-align:center; font-weight:bold;">${p.saldo_atual} ${p.unidade}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
    }

    if (reportConfig.auditoria) {
        const recentes = (movimentacoes || []).sort((a,b) => new Date(b.data) - new Date(a.data)).slice(0, 40);
        html += `<h2>4. Auditoria de Movimentações (Últimos Registos)</h2>`;
        if (recentes.length === 0) {
            html += `<p>Nenhuma movimentação de estoque recente.</p>`;
        } else {
            html += `<table><thead><tr><th>Data/Hora</th><th>Tipo</th><th>Produto (SKU)</th><th>Qtd</th><th>Origem / Destino</th></tr></thead><tbody>`;
            recentes.forEach(m => {
                const p = produtos.find(x => x.id === m.sku || x.sku === m.sku);
                const isEntrada = m.tipo === 'ENTRADA' || m.tipo === 'DEVOLUCAO';
                html += `<tr><td>${new Date(m.data).toLocaleString('pt-BR')}</td><td>${m.tipo}</td><td>${p?.nome||m.sku}</td><td style="text-align:center;">${isEntrada?'+':'-'}${m.qtd}</td><td>${isEntrada ? m.origem : m.destino}</td></tr>`;
            });
            html += `</tbody></table>`;
        }
    }

    html += `
    <div class="signatures">
      <div class="sig-line">Responsável pelo Almoxarifado<br><span style="font-weight:normal; font-size: 10px;">Assinatura</span></div>
      <div class="sig-line">Auditoria / Engenharia<br><span style="font-weight:normal; font-size: 10px;">Assinatura</span></div>
    </div>
    </body></html>`;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    setShowReportModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800 print:hidden">
        <div><h2 className="text-xl font-bold text-white">Visão Global</h2><p className="text-sm text-gray-400">Métricas atualizadas em tempo real.</p></div>
        <Button onClick={() => setShowReportModal(true)} className="!bg-blue-600 !text-white"><FileBarChart className="w-4 h-4 mr-2"/> Gerar Relatório ISO 9001</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card onClick={() => setActiveTab('ESTOQUE')} className="bg-gradient-to-br from-blue-900 to-blue-950 border-blue-800 cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div><p className="text-blue-300 text-sm font-bold uppercase tracking-wider">Itens Estoque</p><p className="text-3xl font-black text-white">{produtosAtivos.length}</p></div>
            <Package className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
        </Card>

        <Card onClick={() => setActiveTab('ESTOQUE')} className="bg-gradient-to-br from-red-900 to-red-950 border-red-800 cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div><p className="text-red-300 text-sm font-bold uppercase tracking-wider">Estoque Baixo</p><p className="text-3xl font-black text-white">{estoqueBaixo.length}</p></div>
            <AlertTriangle className="w-10 h-10 text-red-400 opacity-50" />
          </div>
        </Card>

        <Card onClick={() => setActiveTab('LOCACOES')} className="bg-gradient-to-br from-yellow-900 to-yellow-950 border-yellow-800 cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div><p className="text-yellow-300 text-sm font-bold uppercase tracking-wider">Maquinário Ext.</p><p className="text-3xl font-black text-white">{locacoesAtivas.length}</p></div>
            <Building2 className="w-10 h-10 text-yellow-400 opacity-50" />
          </div>
        </Card>

        <Card onClick={() => setActiveTab('FERRAMENTAS')} className="bg-gradient-to-br from-purple-900 to-purple-950 border-purple-800 cursor-pointer hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div><p className="text-purple-300 text-sm font-bold uppercase tracking-wider">Ferramentas Uso</p><p className="text-3xl font-black text-white">{ferramentasEmUso.length} / {ferramentasAtivas.length}</p></div>
            <Wrench className="w-10 h-10 text-purple-400 opacity-50" />
          </div>
        </Card>
      </div>

      {Object.keys(estoquePorEmpreiteira).length > 0 && (
        <Card title="Insumos Atribuídos por Empreiteira" icon={BarChart2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(estoquePorEmpreiteira).map(([emp, count]) => (
              <div key={emp} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex justify-between items-center">
                <span className="text-gray-300 text-sm font-medium truncate pr-2">{emp}</span>
                <span className="text-xl font-bold text-yellow-500">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <Card title="Relatórios de Auditoria ISO 9001" className="max-w-md w-full">
            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
            <p className="text-sm text-gray-400 mb-4">Selecione quais áreas deseja incluir na impressão deste relatório gerencial:</p>
            <div className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
              <label className="flex items-center gap-3 cursor-pointer text-gray-300"><input type="checkbox" checked={reportConfig.kpi} onChange={e=>setReportConfig({...reportConfig, kpi: e.target.checked})} className="w-5 h-5 rounded border-gray-600 text-yellow-500 bg-gray-900" /> Indicadores Gerais (KPIs)</label>
              <label className="flex items-center gap-3 cursor-pointer text-gray-300"><input type="checkbox" checked={reportConfig.critico} onChange={e=>setReportConfig({...reportConfig, critico: e.target.checked})} className="w-5 h-5 rounded border-gray-600 text-yellow-500 bg-gray-900" /> Análise de Estoque Crítico</label>
              <label className="flex items-center gap-3 cursor-pointer text-gray-300"><input type="checkbox" checked={reportConfig.controlados} onChange={e=>setReportConfig({...reportConfig, controlados: e.target.checked})} className="w-5 h-5 rounded border-gray-600 text-yellow-500 bg-gray-900" /> Matriz de Insumos Controlados (DNA)</label>
              <label className="flex items-center gap-3 cursor-pointer text-gray-300"><input type="checkbox" checked={reportConfig.auditoria} onChange={e=>setReportConfig({...reportConfig, auditoria: e.target.checked})} className="w-5 h-5 rounded border-gray-600 text-yellow-500 bg-gray-900" /> Auditoria de Movimentações (Recentes)</label>
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="secondary" onClick={() => setShowReportModal(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleGeneratePDF} className="flex-1 !bg-blue-600 !text-white"><Printer className="w-4 h-4 mr-2"/> Imprimir Relatório</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const EstoqueView = ({ produtos, onSave, onDelete, onPrintLowStock, onPrintLabel, showMsg }) => {
  const [search, setSearch] = useState('');
  const [filterCateg, setFilterCateg] = useState('ALL');
  const [filterEmpreiteira, setFilterEmpreiteira] = useState('ALL');
  const [filterEstoque, setFilterEstoque] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const filteredItems = useMemo(() => {
    let result = (produtos || []).filter(i => String(i.ativo) !== 'false');
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(i => String(i.nome).toLowerCase().includes(s) || String(i.sku).toLowerCase().includes(s) || String(i.empreiteira || '').toLowerCase().includes(s));
    }
    if (filterCateg !== 'ALL') result = result.filter(i => (i.categoria || 'Geral') === filterCateg);
    if (filterEmpreiteira !== 'ALL') result = result.filter(i => (i.empreiteira || 'Sem Empreiteira') === filterEmpreiteira);
    if (filterEstoque === 'LOW') result = result.filter(i => (Number(i.saldo_atual) || 0) < (Number(i.estoque_minimo) || 5));
    else if (filterEstoque === 'OUT') result = result.filter(i => (Number(i.saldo_atual) || 0) <= 0);
    return result.sort((a,b) => a.nome.localeCompare(b.nome));
  }, [produtos, search, filterCateg, filterEmpreiteira, filterEstoque]);

  const categoriasUnicas = useMemo(() => [...new Set([...CATEGORIAS_PADRAO, ...(produtos || []).map(p => p.categoria || 'Geral')])].sort(), [produtos]);
  const empreiteirasUnicas = useMemo(() => [...new Set((produtos || []).map(p => p.empreiteira).filter(Boolean))].sort(), [produtos]);

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between print:hidden bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input type="text" placeholder="Buscar por nome, SKU ou empreiteira..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none focus:border-yellow-500" />
          </div>
          <select value={filterCateg} onChange={(e) => setFilterCateg(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none"><option value="ALL">Todas Categorias</option>{categoriasUnicas.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select value={filterEmpreiteira} onChange={(e) => setFilterEmpreiteira(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none"><option value="ALL">Todas Empreiteiras</option>{empreiteirasUnicas.map(e => <option key={e} value={e}>{e}</option>)}</select>
          <select value={filterEstoque} onChange={(e) => setFilterEstoque(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none"><option value="ALL">Todos Estoque</option><option value="LOW">Estoque Baixo</option><option value="OUT">Sem Estoque</option></select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onPrintLowStock(produtos)} title="Relatório de Estoque Baixo"><Printer className="w-4 h-4"/></Button>
          <Button onClick={() => { setEditingItem(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-1"/> Adicionar ao Estoque</Button>
        </div>
      </div>

      {showForm && <ProdutoFormModal onClose={() => { setShowForm(false); setEditingItem(null); }} onSave={(d) => { onSave(d); setShowForm(false); setEditingItem(null); }} initialData={editingItem} produtosExistentes={produtos} categorias={categoriasUnicas} empreiteiras={empreiteirasUnicas} showMsg={showMsg} />}

      <div className="grid gap-3">
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12"><Package className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-500">Nenhum item encontrado no estoque.</p></Card>
        ) : (
          filteredItems.map(item => {
            const saldo = Number(item.saldo_atual) || 0;
            const minimo = Number(item.estoque_minimo) || 5;
            const stockStatus = saldo <= 0 ? 'text-red-400' : saldo < minimo ? 'text-yellow-400' : 'text-green-400';

            return (
              <Card key={item.id} className="hover:border-yellow-600 transition-colors p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${saldo <= 0 ? 'bg-red-500' : saldo < minimo ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{item.nome}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-400 font-mono">
                          <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700">{item.sku}</span>
                          <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700">{item.categoria || 'Geral'}</span>
                          <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700">{item.unidade}</span>
                          {item.empreiteira && <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-900/50">{item.empreiteira}</span>}
                          {item.rua && item.prateleira && <span className="bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded border border-yellow-900/50">R{item.rua}-P{item.prateleira}</span>}
                          {item.rastreavel && <span className="bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded border border-purple-900/50 flex items-center gap-1"><Tag size={10}/> PBQP-H</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 border-t lg:border-t-0 border-gray-800 pt-4 lg:pt-0">
                    <div className="text-center"><p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Mínimo</p><p className="text-white font-medium">{minimo}</p></div>
                    <div className="text-center"><p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Atual</p><p className={`text-2xl font-black ${stockStatus}`}>{saldo}</p></div>
                    <div className="flex gap-1.5 print:hidden">
                      <button onClick={() => onPrintLabel([item])} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition" title="Imprimir Etiqueta"><PrinterIcon className="w-4 h-4"/></button>
                      <button onClick={() => { setEditingItem(item); setShowForm(true); }} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-blue-400 transition" title="Editar"><Edit className="w-4 h-4"/></button>
                      <button onClick={async () => { if(await showMsg("Confirmação", `Deseja excluir "${item.nome}"?`, true)) onDelete(item.id); }} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-red-400 transition" title="Excluir"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const ProdutoFormModal = ({ onClose, onSave, initialData, produtosExistentes, categorias, empreiteiras, showMsg }) => {
  const [modo, setModo] = useState(initialData ? 'editar' : 'novo'); // 'novo' | 'existente' | 'editar'
  const [buscaExistente, setBuscaExistente] = useState('');
  
  const [form, setForm] = useState(() => ({
    id: initialData?.id || `PROD-${generateId()}`, sku: initialData?.sku || `SKU-${generateId()}`,
    nome: initialData?.nome || '', descricao: initialData?.descricao || '', categoria: initialData?.categoria || CATEGORIAS_PADRAO[0],
    unidade: initialData?.unidade || 'UN', saldo_atual: initialData?.saldo_atual || 0, qtd_inicial: initialData?.qtd_inicial || 0,
    qtd_entrada: 0, // Novo campo para entrada em item existente
    estoque_minimo: initialData?.estoque_minimo || 5, local_armazenamento: initialData?.local_armazenamento || AREAS_ESTOCAGEM[0],
    rua: initialData?.rua || '', prateleira: initialData?.prateleira || '', empreiteira: initialData?.empreiteira || '',
    dna_type: initialData?.dna_type || '', dna_payload: initialData?.dna_payload || {}, fornecedor_nf: initialData?.fornecedor_nf || '',
    lote: initialData?.lote || '', validade: initialData?.validade || '', preco_unitario: initialData?.preco_unitario || 0, ativo: initialData?.ativo !== false, rastreavel: !!initialData?.rastreavel
  }));

  const [showDna, setShowDna] = useState(form.rastreavel || !!form.dna_type);

  const filteredProd = useMemo(() => {
    if(modo !== 'existente') return [];
    const s = buscaExistente.toLowerCase();
    return produtosExistentes.filter(p => String(p.ativo)!=='false' && (p.nome.toLowerCase().includes(s) || String(p.sku).toLowerCase().includes(s))).slice(0,50);
  }, [produtosExistentes, buscaExistente, modo]);

  const handleSelectExistente = (prodId) => {
      const p = produtosExistentes.find(x => x.id === prodId);
      if(p) {
          setForm({
              ...p,
              qtd_entrada: 0,
              fornecedor_nf: '',
              lote: '',
              validade: ''
          });
          setShowDna(!!p.rastreavel);
      }
  };

  const handleChange = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const handleDnaChange = (f, v) => setForm(p => ({ ...p, dna_payload: { ...p.dna_payload, [f]: v } }));

  const handleSaveClick = () => {
    if (!form.nome.trim()) { showMsg("Atenção", "Nome do item é obrigatório."); return; }
    
    let movimentacao = null;
    let finalSaldo = Number(form.saldo_atual);

    if (modo === 'novo') {
        if(Number(form.qtd_inicial) > 0) {
            movimentacao = {
                id: `MOV-${generateId()}`, data: getLocalISOString(), tipo: 'ENTRADA', sku: form.id, qtd: Number(form.qtd_inicial),
                origem: form.fornecedor_nf || 'Cadastro Inicial', destino: form.local_armazenamento, obs: 'Entrada via Cadastro de Novo Item'
            };
            finalSaldo = Number(form.qtd_inicial);
        }
    } else if (modo === 'existente') {
        const qtdIn = Number(form.qtd_entrada || 0);
        if(qtdIn > 0) {
            movimentacao = {
                id: `MOV-${generateId()}`, data: getLocalISOString(), tipo: 'ENTRADA', sku: form.id, qtd: qtdIn,
                origem: form.fornecedor_nf || 'Atualização/Entrada', destino: form.local_armazenamento, obs: 'Entrada em item existente'
            };
            finalSaldo += qtdIn;
        }
    }

    onSave({ 
        produto: { ...form, saldo_atual: finalSaldo, rastreavel: showDna },
        movimentacao
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card title={modo === 'editar' ? 'Editar Insumo' : 'Adicionar Insumo ao Estoque'} className="max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={24}/></button>
        <div className="space-y-6">
          
          {!initialData && (
              <div className="flex gap-2 p-1 bg-gray-950 rounded-lg border border-gray-800">
                  <button onClick={() => setModo('novo')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${modo==='novo'?'bg-yellow-500 text-gray-900 shadow':'text-gray-400 hover:text-white'}`}>Cadastrar Novo Item (Novo SKU)</button>
                  <button onClick={() => setModo('existente')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${modo==='existente'?'bg-yellow-500 text-gray-900 shadow':'text-gray-400 hover:text-white'}`}>Dar Entrada em Existente (Manter SKU)</button>
              </div>
          )}

          {modo === 'existente' && (
              <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 animate-in fade-in">
                  <Input label="Pesquisar Produto Existente" value={buscaExistente} onChange={e=>setBuscaExistente(e.target.value)} placeholder="Digite para filtrar..." autoFocus className="mb-2"/>
                  <Select label="Selecione o Insumo" value={form.id} onChange={(e) => handleSelectExistente(e.target.value)} options={[{value:'', label:'Selecione da lista...'}, ...filteredProd.map(p => ({ value: p.id, label: `[${p.sku}] ${p.nome} - Saldo: ${p.saldo_atual}` }))]} />
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Nome do Item" value={form.nome} onChange={(e) => handleChange('nome', e.target.value)} required autoFocus={modo==='novo'}/><Input label="SKU/Código" value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} disabled={modo==='existente'} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Select label="Categoria" value={form.categoria} onChange={(e) => handleChange('categoria', e.target.value)} options={categorias} /><Input label="Unidade" value={form.unidade} onChange={(e) => handleChange('unidade', e.target.value.toUpperCase())} placeholder="UN, KG, M, L" /><Input label="Preço Unitário (R$)" type="number" step="0.01" value={form.preco_unitario} onChange={(e) => handleChange('preco_unitario', parseFloat(e.target.value) || 0)} /></div>
          
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2 text-sm"><Building2 size={16}/> Apropriação / Empreiteira</h3>
            <Input label="Empreiteira / Centro de Custo" value={form.empreiteira} onChange={(e) => handleChange('empreiteira', e.target.value)} list="empreiteiras-list" placeholder="Digite ou selecione..." />
            <datalist id="empreiteiras-list">
                {empreiteiras.map(e => <option key={e} value={e} />)}
            </datalist>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
            <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2 text-sm"><MapPin size={16}/> Localização Física</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Select label="Área de Estocagem" value={form.local_armazenamento} onChange={(e) => handleChange('local_armazenamento', e.target.value)} options={AREAS_ESTOCAGEM} /><Input label="Rua (Opcional)" value={form.rua} onChange={(e) => handleChange('rua', e.target.value)} placeholder="Ex: A, B, 1" /><Input label="Prateleira (Opcional)" value={form.prateleira} onChange={(e) => handleChange('prateleira', e.target.value)} placeholder="Ex: P1, 05" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modo === 'existente' ? (
                <>
                <Input label="Saldo Atual no Sistema" type="number" value={form.saldo_atual} disabled className="opacity-50" />
                <Input label="Qtd a dar Entrada Agora" type="number" value={form.qtd_entrada} onChange={(e) => handleChange('qtd_entrada', parseFloat(e.target.value) || 0)} className="border-green-500 bg-green-900/10" />
                </>
            ) : (
                <Input label="Quantidade Inicial" type="number" value={form.qtd_inicial} onChange={(e) => handleChange('qtd_inicial', parseFloat(e.target.value) || 0)} />
            )}
            <Input label="Estoque Mínimo" type="number" value={form.estoque_minimo} onChange={(e) => handleChange('estoque_minimo', parseFloat(e.target.value) || 0)} />
          </div>

          <div className="border border-purple-900/50 bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-3">
              <h3 className="text-purple-400 font-semibold flex items-center gap-2 text-sm"><ClipboardCheck size={16}/> Controle Rigoroso (PBQP-H / ISO 9001)</h3>
              <label className="flex items-center gap-2 cursor-pointer bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-700 transition"><input type="checkbox" checked={showDna} onChange={(e) => setShowDna(e.target.checked)} className="rounded border-gray-600 bg-gray-900 text-purple-500 w-4 h-4 cursor-pointer" /><span className="text-sm font-bold text-gray-300">Ativar DNA Material</span></label>
            </div>
            {showDna && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Input label="Fornecedor / NF" value={form.fornecedor_nf} onChange={(e) => handleChange('fornecedor_nf', e.target.value)} /><Input label="Lote Identificador" value={form.lote} onChange={(e) => handleChange('lote', e.target.value)} /><Input label="Data de Validade" type="date" value={form.validade ? form.validade.split('T')[0] : ''} onChange={(e) => handleChange('validade', e.target.value)} /></div>
                <Select label="Classificação Estrutural (Tipo de DNA)" value={form.dna_type} onChange={(e) => { handleChange('dna_type', e.target.value); handleChange('dna_payload', {}); }} options={['', ...Object.keys(DNA_TEMPLATES)]} />
                {form.dna_type && DNA_TEMPLATES[form.dna_type] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-950 p-4 rounded-lg border border-gray-800">
                    {DNA_TEMPLATES[form.dna_type].map(field => field.type === 'select' ? ( <Select key={field.name} label={field.label} value={form.dna_payload[field.name] || ''} onChange={(e) => handleDnaChange(field.name, e.target.value)} options={['', ...(field.options||[])]} /> ) : ( <Input key={field.name} label={field.label} type={field.type || 'text'} placeholder={field.placeholder} value={form.dna_payload[field.name] || ''} onChange={(e) => handleDnaChange(field.name, e.target.value)} /> ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div><label className="block text-xs font-medium text-gray-400 mb-1">Observações Adicionais</label><textarea value={form.descricao} onChange={(e) => handleChange('descricao', e.target.value)} rows={2} className="w-full p-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 focus:border-yellow-500 outline-none" placeholder="Informações extra..." /></div>

          <div className="flex gap-3 pt-4 border-t border-gray-800"><Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button><Button onClick={handleSaveClick} className="flex-1 !bg-green-600 !text-white"><Save className="w-4 h-4 mr-2"/> Guardar Insumo no Estoque</Button></div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// 10. VIEW: MOVIMENTAÇÕES DE ESTOQUE
// ============================================================================

const MovimentacoesView = ({ movimentacoes, produtos, onSave, onPrint, showMsg }) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('ALL');
  const [filterEmpreiteira, setFilterEmpreiteira] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredItems = useMemo(() => {
    let result = (movimentacoes || []).sort((a, b) => new Date(b.data) - new Date(a.data));
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(m => String(m.sku).toLowerCase().includes(s) || String(m.obs).toLowerCase().includes(s) || String(m.destino).toLowerCase().includes(s) || String(m.responsavel).toLowerCase().includes(s));
    }
    if (filterTipo !== 'ALL') result = result.filter(m => m.tipo === filterTipo);
    if (filterEmpreiteira !== 'ALL') result = result.filter(m => { const p = produtos.find(x => x.id === m.sku || x.sku === m.sku); return (p?.empreiteira || 'Sem Empreiteira') === filterEmpreiteira; });
    if (startDate) result = result.filter(m => new Date(m.data) >= new Date(startDate));
    if (endDate) result = result.filter(m => new Date(m.data) <= new Date(endDate + 'T23:59:59'));
    return result;
  }, [movimentacoes, search, filterTipo, filterEmpreiteira, startDate, endDate, produtos]);

  const empreiteirasUnicas = useMemo(() => [...new Set((produtos || []).map(p => p.empreiteira).filter(Boolean))].sort(), [produtos]);

  const handleSaveMov = async (formData) => {
    await onSave(formData);
    setShowForm(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-800 print:hidden">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" /><input type="text" placeholder="Buscar por código, obs ou resp..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none focus:border-yellow-500" /></div>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none"><option value="ALL">Todos Tipos</option><option value="ENTRADA">Entradas</option><option value="SAIDA">Saídas</option><option value="DEVOLUCAO">Devoluções</option><option value="AJUSTE">Ajustes</option></select>
          <select value={filterEmpreiteira} onChange={(e) => setFilterEmpreiteira(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none"><option value="ALL">Todas Empreiteiras</option>{empreiteirasUnicas.map(e => <option key={e} value={e}>{e}</option>)}</select>
          <DateRangeFilter startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} onClear={() => { setStartDate(''); setEndDate(''); }} />
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => onPrint(filteredItems)} className="mr-2" title="Imprimir Filtro Atual"><Printer className="w-4 h-4 mr-2"/> Imprimir Relatório</Button>
            <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1"/> Lançar</Button>
        </div>
      </div>

      {showForm && <MovimentacaoFormModal onClose={() => setShowForm(false)} onSave={handleSaveMov} produtos={produtos} showMsg={showMsg} />}

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12"><ArrowRightLeft className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-500">Nenhum registo de auditoria encontrado.</p></Card>
        ) : (
          filteredItems.slice(0, 100).map(mov => {
            const produto = produtos.find(p => p.id === mov.sku || p.sku === mov.sku);
            const isEntrada = mov.tipo === 'ENTRADA' || mov.tipo === 'DEVOLUCAO';
            return (
              <Card key={mov.id} className="hover:border-yellow-600 transition-colors p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isEntrada ? 'bg-green-900/30 text-green-400' : mov.tipo==='AJUSTE'?'bg-blue-900/30 text-blue-400':'bg-red-900/30 text-red-400'}`}>
                      {isEntrada ? <ArrowDownCircle className="w-5 h-5"/> : <ArrowRightLeft className="w-5 h-5"/>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-base truncate">{produto?.nome || mov.sku}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-0.5">
                        <span className={`font-black ${isEntrada?'text-green-500':mov.tipo==='AJUSTE'?'text-blue-500':'text-red-500'}`}>{mov.tipo}</span>
                        <span className="font-mono">{formatBRDate(mov.data)}</span>
                        <span><span className="text-gray-500 font-bold">Local:</span> {isEntrada ? mov.origem : mov.destino}</span>
                        {mov.responsavel && <span><span className="text-gray-500 font-bold">Resp:</span> {mov.responsavel}</span>}
                        {produto?.empreiteira && <span className="bg-gray-800 border border-gray-700 px-1.5 rounded text-gray-300">{produto.empreiteira}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className={`text-2xl font-black ${isEntrada ? 'text-green-400' : mov.tipo==='AJUSTE'?'text-blue-400':'text-red-400'}`}>{isEntrada ? '+' : (mov.tipo==='AJUSTE'?'':'')}{mov.qtd}</p>
                    <p className="text-[10px] text-gray-500 max-w-[150px] truncate" title={mov.obs}>{mov.obs || '-'}</p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const MovimentacaoFormModal = ({ onClose, onSave, produtos, showMsg }) => {
  const [form, setForm] = useState({ id: `MOV-${generateId()}`, data: getLocalISOString(), tipo: 'SAIDA', sku: '', qtd: '', responsavel: '', origem: AREAS_ESTOCAGEM[0], destino: '', obs: '' });
  const [busca, setBusca] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const filteredProd = useMemo(() => {
      const s = busca.toLowerCase();
      return produtos.filter(p => String(p.ativo)!=='false' && (p.nome.toLowerCase().includes(s) || String(p.sku).toLowerCase().includes(s))).slice(0,50);
  }, [produtos, busca]);

  const handleChange = (f, v) => setForm(p => ({ ...p, [f]: v }));
  
  useEffect(() => {
      if(form.sku) { const p = produtos.find(x => x.id === form.sku || x.sku === form.sku); setProdutoSelecionado(p||null); }
  }, [form.sku, produtos]);

  // Adjust default Origem/Destino logic based on Type
  useEffect(() => {
      if (form.tipo === 'SAIDA') {
          setForm(p => ({ ...p, origem: AREAS_ESTOCAGEM[0], destino: '' }));
      } else if (form.tipo === 'DEVOLUCAO') {
          setForm(p => ({ ...p, origem: '', destino: AREAS_ESTOCAGEM[0] }));
      } else if (form.tipo === 'ENTRADA') {
          setForm(p => ({ ...p, origem: 'Fornecedor', destino: AREAS_ESTOCAGEM[0] }));
      }
  }, [form.tipo]);

  const handleSaveClick = async () => {
    if (!form.sku || !form.qtd || Number(form.qtd) <= 0) { showMsg("Aviso", "Selecione um produto e informe uma quantidade válida."); return; }
    if (!produtoSelecionado) return;
    
    const saldoAtual = Number(produtoSelecionado.saldo_atual) || 0;
    const q = Number(form.qtd);
    let novoSaldo = saldoAtual;

    if (form.tipo === 'ENTRADA' || form.tipo === 'DEVOLUCAO') {
        novoSaldo += q;
    }
    else if (form.tipo === 'SAIDA') {
        if(q > saldoAtual) {
            const conf = await new Promise(r => showMsg("Alerta de Estoque Negativo", `A quantidade a sair (${q}) é maior que o saldo atual (${saldoAtual}). Deseja prosseguir e deixar o saldo negativo?`, true).then(res => r(res)));
            if(!conf) return;
        }
        novoSaldo -= q;
    } else if (form.tipo === 'AJUSTE') {
        novoSaldo = q;
    }

    const produtoAtualizado = { ...produtoSelecionado, saldo_atual: novoSaldo };
    await AppDB.put('produtos', produtoAtualizado);
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card title="Lançar Movimentação" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={24}/></button>
        <div className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg"><Input label="Pesquisar Produto (Nome/SKU)" value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Digite para filtrar a lista..." autoFocus className="mb-2"/><Select label="Selecione o Insumo" value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} options={[{value:'', label:'Selecione um produto da lista...'}, ...filteredProd.map(p => ({ value: p.id, label: `[${p.sku}] ${p.nome}` }))]} /></div>

          {produtoSelecionado && (
            <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3 text-sm flex justify-between items-center">
              <div><p className="text-gray-400">Saldo Atual</p><p className="text-xl font-bold text-white">{produtoSelecionado.saldo_atual} <span className="text-sm font-normal text-gray-400">{produtoSelecionado.unidade}</span></p></div>
              <div className="text-right">{produtoSelecionado.empreiteira && <p className="text-blue-400 font-bold">{produtoSelecionado.empreiteira}</p>}{produtoSelecionado.rua && <p className="text-yellow-400 font-mono text-xs">R{produtoSelecionado.rua}-P{produtoSelecionado.prateleira}</p>}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4"><Select label="Tipo de Operação" value={form.tipo} onChange={(e) => handleChange('tipo', e.target.value)} options={['SAIDA', 'ENTRADA', 'DEVOLUCAO', 'AJUSTE']} /><Input label="Quantidade" type="number" value={form.qtd} onChange={(e) => handleChange('qtd', e.target.value)} /></div>
          
          <Input label="Nome de quem está retirando/devolvendo (Responsável)" value={form.responsavel} onChange={(e) => handleChange('responsavel', e.target.value)} placeholder="Ex: João Silva" />

          <div className="grid grid-cols-2 gap-4 bg-gray-950 p-4 rounded-lg border border-gray-800">
             {form.tipo === 'SAIDA' ? (
                 <>
                 <Select label="De Qual Estoque (Origem)" value={form.origem} onChange={e=>handleChange('origem', e.target.value)} options={AREAS_ESTOCAGEM} />
                 <Input label="Para Qual Obra/Setor (Destino)" value={form.destino} onChange={e=>handleChange('destino', e.target.value)} placeholder="Ex: Obra Alpha" />
                 </>
             ) : form.tipo === 'DEVOLUCAO' ? (
                 <>
                 <Input label="De Qual Obra Voltou (Origem)" value={form.origem} onChange={e=>handleChange('origem', e.target.value)} placeholder="Ex: Obra Alpha" />
                 <Select label="Para Qual Estoque (Destino)" value={form.destino} onChange={e=>handleChange('destino', e.target.value)} options={AREAS_ESTOCAGEM} />
                 </>
             ) : form.tipo === 'ENTRADA' ? (
                 <>
                 <Input label="Fornecedor (Origem)" value={form.origem} onChange={e=>handleChange('origem', e.target.value)} placeholder="Ex: Fornecedor X" />
                 <Select label="Para Qual Estoque (Destino)" value={form.destino} onChange={e=>handleChange('destino', e.target.value)} options={AREAS_ESTOCAGEM} />
                 </>
             ) : (
                 <>
                 <Input label="Local de Origem" value={form.origem} onChange={(e) => handleChange('origem', e.target.value)} />
                 <Input label="Local de Destino" value={form.destino} onChange={(e) => handleChange('destino', e.target.value)} />
                 </>
             )}
          </div>

          <div><label className="block text-xs font-medium text-gray-400 mb-1">Motivo / Observação</label><textarea value={form.obs} onChange={(e) => handleChange('obs', e.target.value)} rows={2} className="w-full p-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 outline-none focus:border-yellow-500" /></div>

          <div className="flex gap-3 pt-4 border-t border-gray-800"><Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button><Button onClick={handleSaveClick} className="flex-1 !bg-blue-600 !text-white"><Save className="w-4 h-4 mr-2"/> Efetivar Registo</Button></div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// NOVO MODULO: DESPERDÍCIOS E PERDAS
// ============================================================================

const DesperdiciosView = ({ desperdicios, produtos, onSave, showMsg }) => {
  const [showForm, setShowForm] = useState(false);
  const [filterEmpreiteira, setFilterEmpreiteira] = useState('ALL');

  const filteredItems = useMemo(() => {
    let result = (desperdicios || []).sort((a,b) => new Date(b.data) - new Date(a.data));
    if (filterEmpreiteira !== 'ALL') result = result.filter(d => d.empreiteira === filterEmpreiteira);
    return result;
  }, [desperdicios, filterEmpreiteira]);

  const empreiteirasUnicas = useMemo(() => [...new Set((produtos || []).map(p => p.empreiteira).filter(Boolean))].sort(), [produtos]);

  const handleSaveDesperdicio = async (formData) => {
    await onSave(formData);
    setShowForm(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="flex gap-2 flex-1">
          <select value={filterEmpreiteira} onChange={(e) => setFilterEmpreiteira(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none w-full sm:max-w-xs"><option value="ALL">Todas Empreiteiras</option>{empreiteirasUnicas.map(e => <option key={e} value={e}>{e}</option>)}</select>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => printDesperdiciosReport(desperdicios, produtos, filterEmpreiteira, showMsg)} className="mr-2 !text-red-400 !border-red-900 hover:!bg-red-900/30" title="Imprimir Relatório de Perdas"><Printer className="w-4 h-4 mr-2"/> Relatório Empreiteira</Button>
            <Button onClick={() => setShowForm(true)} className="!bg-red-600 !text-white hover:!bg-red-500"><AlertOctagon className="w-4 h-4 mr-1"/> Registar Desperdício</Button>
        </div>
      </div>

      {showForm && <DesperdicioFormModal onClose={() => setShowForm(false)} onSave={handleSaveDesperdicio} produtos={produtos} empreiteiras={empreiteirasUnicas} showMsg={showMsg} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800"><AlertOctagon className="w-12 h-12 text-gray-600 mx-auto mb-3"/><p className="text-gray-500">Nenhum registo de perda ou desperdício encontrado.</p></div>
        ) : (
          filteredItems.map(d => {
            const p = produtos.find(x => x.id === d.produto_id);
            return (
              <Card key={d.id} className="border-red-900/30 bg-gray-900 p-0 overflow-hidden flex flex-col h-full">
                {d.foto_url ? (
                    <div className="h-32 w-full bg-black relative"><img src={d.foto_url} className="w-full h-full object-cover opacity-80" alt="Evidência"/></div>
                ) : (
                    <div className="h-10 w-full bg-red-900/20 border-b border-red-900/50 flex items-center justify-center text-xs text-red-500 font-bold uppercase tracking-widest">Sem Evidência Fotográfica</div>
                )}
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2"><h3 className="text-white font-bold truncate pr-2">{p?.nome || 'Desconhecido'}</h3><span className="text-red-400 font-black text-lg">-{d.qtd}</span></div>
                  <p className="text-xs text-blue-400 font-bold mb-3">{d.empreiteira}</p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p><strong className="text-gray-300">Local:</strong> {d.local_encontrado}</p>
                    <p><strong className="text-gray-300">Motivo:</strong> {d.estado}</p>
                    <p><strong className="text-gray-300">Custo Perda:</strong> <span className="text-red-400 font-bold">R$ {Number(d.valor_total).toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const DesperdicioFormModal = ({ onClose, onSave, produtos, empreiteiras, showMsg }) => {
  const [form, setForm] = useState({ id: `DESP-${generateId()}`, data: getLocalISOString(), empreiteira: '', produto_id: '', qtd: '', local_encontrado: '', estado: 'Quebrado', foto_url: '', obs: '' });
  
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);

  useEffect(() => {
      if (form.empreiteira) {
          setProdutosFiltrados(produtos.filter(p => p.empreiteira === form.empreiteira && String(p.ativo)!=='false').sort((a,b)=>a.nome.localeCompare(b.nome)));
      } else {
          setProdutosFiltrados([]);
      }
      setForm(p => ({...p, produto_id: ''})); // reset product when empreiteira changes
  }, [form.empreiteira, produtos]);

  const handleChange = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleCapture = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const b64 = await resizeImage(file, 800);
              setForm(p => ({ ...p, foto_url: b64 }));
          } catch(err) {
              showMsg("Erro", "Falha ao processar a fotografia da câmera.");
          }
      }
  };

  const handleSaveClick = async () => {
    if (!form.empreiteira || !form.produto_id || !form.qtd || Number(form.qtd) <= 0) { showMsg("Aviso", "Preencha a Empreiteira, o Produto e a Quantidade."); return; }
    
    const prod = produtos.find(p => p.id === form.produto_id);
    if (!prod) return;

    const custo = Number(form.qtd) * Number(prod.preco_unitario || 0);

    const desperdicioData = { ...form, valor_total: custo };

    // Atualiza saldo do produto
    const novoSaldo = Math.max(0, (Number(prod.saldo_atual) || 0) - Number(form.qtd));
    await AppDB.put('produtos', { ...prod, saldo_atual: novoSaldo });

    // Cria movimentacao
    await AppDB.put('movimentacoes_estoque', {
        id: `MOV-${generateId()}`, data: getLocalISOString(), tipo: 'SAIDA', sku: prod.id, qtd: Number(form.qtd),
        origem: prod.local_armazenamento || LOCACAO_ESTOQUE_LOCAL, destino: 'DESCARTE / PERDA', obs: `Desperdício: ${form.estado} - ${form.local_encontrado}`
    });

    onSave(desperdicioData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card title="Registar Desperdício / Perda" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={24}/></button>
        <div className="space-y-4">
          
          <Select label="Selecione a Empreiteira / Centro de Custo" value={form.empreiteira} onChange={e=>handleChange('empreiteira', e.target.value)} options={[{value:'', label:'Selecione...'}, ...empreiteiras]} />

          {form.empreiteira && (
              <Select label="Selecione o Insumo Perdido (Para calcular o custo)" value={form.produto_id} onChange={e=>handleChange('produto_id', e.target.value)} options={[{value:'', label:'Selecione um produto da lista...'}, ...produtosFiltrados.map(p => ({ value: p.id, label: `[${p.sku}] ${p.nome} - R$ ${p.preco_unitario||0}` }))]} />
          )}

          <div className="grid grid-cols-2 gap-4"><Input label="Quantidade Perdida" type="number" value={form.qtd} onChange={e=>handleChange('qtd', e.target.value)} /><Select label="Estado / Motivo" value={form.estado} onChange={e=>handleChange('estado', e.target.value)} options={['Quebrado', 'Vencido', 'Extraviado', 'Mau Uso', 'Danificado por Chuva', 'Outros']} /></div>
          
          <Input label="Onde foi encontrado? (Local na Obra)" value={form.local_encontrado} onChange={e=>handleChange('local_encontrado', e.target.value)} placeholder="Ex: Torre B, Andar 5" />

          <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
              <label className="block text-xs font-medium text-gray-400 mb-2">Evidência Fotográfica (Câmera)</label>
              <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-blue-900/30 text-blue-400 border border-blue-800/50 px-4 py-3 rounded-lg hover:bg-blue-900/50 transition-colors flex items-center justify-center flex-1">
                      <Camera size={24} className="mr-2"/> Tirar Foto
                      <input type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
                  </label>
                  {form.foto_url && <img src={form.foto_url} alt="Evidência" className="h-16 w-16 object-cover rounded border border-gray-600" />}
              </div>
          </div>

          <div><label className="block text-xs font-medium text-gray-400 mb-1">Observações Adicionais</label><textarea value={form.obs} onChange={(e) => handleChange('obs', e.target.value)} rows={2} className="w-full p-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 outline-none focus:border-yellow-500" /></div>

          <div className="flex gap-3 pt-4 border-t border-gray-800"><Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button><Button onClick={handleSaveClick} className="flex-1 !bg-red-600 !text-white hover:!bg-red-500"><AlertOctagon className="w-4 h-4 mr-2"/> Efetivar Registo de Perda</Button></div>
        </div>
      </Card>
    </div>
  );
};


// ============================================================================
// 12. VIEW: REQUISIÇÕES (MODELO ANTIGO - 15 LINHAS FIXAS E AUTOFILL)
// ============================================================================

const RequisicoesView = ({ requisicoes, produtos, onSave, onUpdate, showMsg }) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredItems = useMemo(() => {
    let result = (requisicoes || []).sort((a, b) => new Date(b.created_at || b.data) - new Date(a.created_at || a.data));
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r => String(r.numero).toLowerCase().includes(s) || String(r.requisitante).toLowerCase().includes(s) || String(r.obra_destino).toLowerCase().includes(s));
    }
    if (filterStatus !== 'ALL') result = result.filter(r => (r.status || 'Rascunho') === filterStatus);
    return result;
  }, [requisicoes, search, filterStatus]);

  const printRequisicao = (req) => {
    const printWindow = window.open('', '', 'height=800,width=900');
    if (!printWindow) { showMsg('Atenção', 'Permita popups para imprimir.'); return; }
    
    let html = `<html><head><title>Solicitação de Compra ${req.numero}</title>
    <style>
      @page { size: A4 portrait; margin: 10mm; }
      body { font-family: Arial, sans-serif; padding: 0; margin: 0; font-size: 11px; color: black; background: white; }
      .container { width: 100%; max-width: 190mm; margin: auto; }
      table { width: 100%; border-collapse: collapse; border: 2px solid black; margin-bottom: 6px; }
      th, td { border: 1px solid black; padding: 4px; text-align: left; }
      .center { text-align: center; }
      .bg-dark { background-color: #000; color: white; font-weight: bold; text-align: center; padding: 4px; font-size: 11px; }
      .bg-light { background-color: #f0f0f0; font-weight: bold; }
      .header-table td { padding: 8px; vertical-align: middle; border: 2px solid black; }
      .header-logo { max-height: 40px; filter: grayscale(100%) contrast(200%); }
      .signatures { display: flex; justify-content: center; margin-top: 60px; padding: 0 10px; }
      .sig-line { width: 50%; text-align: center; border-top: 1px solid black; padding-top: 5px; font-weight: bold; font-size: 12px;}
    </style></head><body><div class="container">
    <table class="header-table"><tr><td style="width: 25%; text-align: center;"><img src="${LOGO_URL}" class="header-logo" alt="${SYSTEM_NAME}"></td><td style="width: 50%;"><div style="font-size: 18px; font-weight: bold; text-transform: uppercase; text-align: center;">SOLICITAÇÃO DE COMPRA</div></td><td style="width: 25%; text-align: center; font-size: 14px; font-weight: bold; color: red;">Nº <u>${req.numero}</u></td></tr></table>
    <table><tr><td class="bg-light" style="width: 10%;">DATA:</td><td style="width: 23%;">${req.data ? new Date(req.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : ''}</td><td class="bg-light" style="width: 15%;">Requisitante:</td><td style="width: 30%;">${req.requisitante || ''}</td><td class="bg-light" style="width: 10%;">Entrega:</td><td style="width: 12%;">${req.prazo_entrega || ''}</td></tr></table>
    <table><tr><td colspan="2" class="bg-dark">OBRA DESTINO</td></tr><tr><td class="bg-light" style="width: 20%;">Obra Destino:</td><td>${req.obra_destino || ''}</td></tr><tr><td class="bg-light">Observações gerais:</td><td>${req.obs_gerais || '&nbsp;'}</td></tr></table>
    <table><tr><td colspan="4" class="bg-dark">DADOS PARA ENTREGA</td></tr><tr><td class="bg-light" style="width: 10%;">OBRA:</td><td colspan="3">${req.obra_destino || ''}</td></tr><tr><td class="bg-light">RUA:</td><td style="width: 50%;">${req.entrega_rua || ''}</td><td class="bg-light" style="width: 5%;">Nº:</td><td>${req.entrega_numero || ''}</td></tr><tr><td class="bg-light">BAIRRO:</td><td>${req.entrega_bairro || ''}</td><td class="bg-light">CIDADE:</td><td>${req.entrega_cidade || ''}</td></tr><tr><td class="bg-light">Obs:</td><td colspan="3">${req.entrega_obs || '&nbsp;'}</td></tr></table>
    <table><tr><td colspan="3" class="bg-dark">SUGESTÕES DE FORNECEDORES</td></tr><tr class="center bg-light"><td style="width: 33%;">FORNECEDOR 1</td><td style="width: 33%;">FORNECEDOR 2</td><td style="width: 33%;">FORNECEDOR 3</td></tr><tr class="center"><td>${req.fornecedor_1 || '&nbsp;'}</td><td>${req.fornecedor_2 || '&nbsp;'}</td><td>${req.fornecedor_3 || '&nbsp;'}</td></tr><tr><td class="bg-light" style="width: 15%; border-right: none;">Observações:</td><td colspan="2" style="border-left: none;">${req.obs_fornecedores || '&nbsp;'}</td></tr></table>
    <table><thead class="bg-light center"><tr><th style="width: 40%">Descrição do item</th><th style="width: 15%">Cód. Insumo</th><th style="width: 10%">Un.</th><th style="width: 10%">Qtde</th><th style="width: 25%">Observações sobre itens</th></tr></thead><tbody>`;
    
    const filledItens = (req.itens || []).filter(i => i.descricao);
    for (let i = 0; i < 15; i++) {
        const item = filledItens[i] || { qtde: '', un: '', descricao: '', cod_insumo: '', obs: '' };
        html += `<tr><td>${item.descricao || '&nbsp;'}</td><td class="center">${item.cod_insumo || '&nbsp;'}</td><td class="center">${item.un || '&nbsp;'}</td><td class="center">${item.qtde || '&nbsp;'}</td><td>${item.obs || '&nbsp;'}</td></tr>`;
    }
    
    html += `</tbody></table><div class="signatures"><div class="sig-line">Assinatura</div></div></div></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" /><input type="text" placeholder="Buscar por número, solicitante ou obra..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none focus:border-yellow-500" /></div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 outline-none"><option value="ALL">Todos Status</option><option value="Rascunho">Rascunho</option><option value="Aprovado">Aprovado</option><option value="Reprovado">Reprovado</option></select>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1"/> Montar Requisição</Button>
      </div>

      {showForm && <RequisicaoFormModal onClose={() => setShowForm(false)} onSave={(data) => { onSave(data); setShowForm(false); }} produtos={produtos} requisicoes={requisicoes} showMsg={showMsg} />}

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12"><FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-500">Nenhuma requisição/pedido encontrado.</p></Card>
        ) : (
          filteredItems.map(req => {
            const filledItens = (req.itens || []).filter(i => i.descricao);
            return (
            <Card key={req.id} className="hover:border-yellow-600 transition-colors p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2"><h3 className="text-white font-black text-lg">REQ-{req.numero}</h3><StatusBadge status={req.status || 'Rascunho'} /></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-400 mb-4">
                      <div><span className="block text-[10px] uppercase font-bold text-gray-600">Emissão</span><span className="font-mono text-gray-300">{formatBRDate(req.data)}</span></div>
                      <div><span className="block text-[10px] uppercase font-bold text-gray-600">Requisitante</span><span className="text-gray-300 truncate">{req.requisitante}</span></div>
                      <div className="md:col-span-2"><span className="block text-[10px] uppercase font-bold text-gray-600">Obra / Destino</span><span className="text-yellow-500 font-bold truncate">{req.obra_destino}</span></div>
                  </div>
                  {filledItens.length > 0 && (
                    <div className="bg-gray-950 rounded border border-gray-800 p-3 max-h-32 overflow-y-auto custom-scrollbar">
                      <p className="text-[10px] uppercase font-bold text-gray-600 mb-1">Itens Solicitados ({filledItens.length})</p>
                      {filledItens.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-1 border-b border-gray-800/50 last:border-0"><span className="text-gray-300">{item.descricao}</span><span className="font-bold text-white">{item.qtde} <span className="text-gray-500">{item.un}</span></span></div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex md:flex-col gap-2 shrink-0 border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
                  {(req.status || 'Rascunho') === 'Rascunho' && (
                    <React.Fragment>
                      <Button variant="outline" onClick={() => onUpdate({ ...req, status: 'Aprovado' })} className="!p-2 !bg-green-900/20 !border-green-800 hover:!bg-green-800 !text-green-400" title="Aprovar"><Check size={18}/></Button>
                      <Button variant="outline" onClick={() => onUpdate({ ...req, status: 'Reprovado' })} className="!p-2 !bg-red-900/20 !border-red-800 hover:!bg-red-800 !text-red-400" title="Reprovar"><X size={18}/></Button>
                    </React.Fragment>
                  )}
                  <Button variant="secondary" onClick={() => printRequisicao(req)} className="!p-2 w-full md:w-auto" title="Imprimir PDF Clássico"><Printer size={18}/></Button>
                  <Button variant="danger" onClick={async () => { if(await showMsg("Excluir", `Apagar requisição REQ-${req.numero}?`, true)) AppDB.delete('requisicoes', req.id); window.location.reload(); }} className="!p-2 w-full md:w-auto"><Trash2 size={18}/></Button>
                </div>
              </div>
            </Card>
          )})
        )}
      </div>
    </div>
  );
};

const RequisicaoFormModal = ({ onClose, onSave, produtos, requisicoes, showMsg }) => {
  const getNextReqNumber = useCallback(() => {
      if (!requisicoes || requisicoes.length === 0) return '01';
      const numeros = requisicoes.map(r => {
          const parsed = parseInt(r.numero, 10);
          return isNaN(parsed) ? 0 : parsed;
      });
      const maxNumber = Math.max(...numeros);
      const nextNumber = maxNumber + 1;
      return nextNumber < 10 ? `0${nextNumber}` : String(nextNumber);
  }, [requisicoes]);

  const getEmptyRows = () => Array(15).fill().map(() => ({ descricao: '', cod_insumo: '', un: '', qtde: '', obs: '' }));

  const [form, setForm] = useState({
      id: `REQ-${generateId()}`, numero: getNextReqNumber(), data: getLocalISOString().slice(0, 10), requisitante: '', prazo_entrega: '', obra_destino: '',
      obs_gerais: '', entrega_rua: '', entrega_numero: '', entrega_bairro: '', entrega_cidade: '', entrega_obs: '', 
      fornecedor_1: '', fornecedor_2: '', fornecedor_3: '', obs_fornecedores: '', itens: getEmptyRows(), status: 'Rascunho'
  });

  const handleChange = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleItemChange = (index, field, value) => {
      const newItens = [...form.itens];
      newItens[index][field] = value;
      // Auto-fill logic when description changes
      if (field === 'descricao') {
          const matchedProd = produtos.find(p => String(p.nome).toLowerCase() === String(value).toLowerCase());
          if (matchedProd) {
              if (!newItens[index].un) newItens[index].un = matchedProd.unidade || 'UN';
              if (!newItens[index].cod_insumo) newItens[index].cod_insumo = matchedProd.sku || '';
          }
      }
      setForm({...form, itens: newItens});
  };

  const handleSaveClick = () => {
    if (!form.requisitante || !form.obra_destino) { showMsg("Aviso", "Preencha o requisitante e a obra de destino."); return; }
    const filledItens = form.itens.filter(i => i.descricao.trim() !== '');
    if (filledItens.length === 0) { showMsg("Aviso", "Adicione pelo menos um item à lista da requisição."); return; }
    
    // Save exactly the 15 array structure to keep parity with the print layout if needed
    onSave({ ...form, created_at: getLocalISOString() });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card title="Emitir Solicitação de Compra" className="max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={24}/></button>
        <div className="space-y-6">
          <datalist id="produtos-list">
              {(produtos || []).filter(p => String(p.ativo) !== 'false').map(p => <option key={p.id} value={p.nome} />)}
          </datalist>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-950 p-4 rounded-lg border border-gray-800">
            <Input label="Nº Doc (Sequencial)" value={form.numero} onChange={e=>handleChange('numero', e.target.value)} className="font-mono text-yellow-500" />
            <Input type="date" label="Data do Pedido" value={form.data} onChange={e=>handleChange('data', e.target.value)} />
            <Input label="Requisitante (Solicitante)" value={form.requisitante} onChange={e=>handleChange('requisitante', e.target.value)} required className="md:col-span-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Obra Destino / Aplicação" value={form.obra_destino} onChange={e=>handleChange('obra_destino', e.target.value)} required />
            <Input label="Prazo Entrega Solicitado" value={form.prazo_entrega} onChange={e=>handleChange('prazo_entrega', e.target.value)} placeholder="Ex: Imediato, 15 dias" />
            <div className="md:col-span-2"><Input label="Observações Gerais da Obra" value={form.obs_gerais} onChange={e=>handleChange('obs_gerais', e.target.value)} /></div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-bold mb-3">Dados para Entrega</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <Input label="Rua" value={form.entrega_rua} onChange={e=>handleChange('entrega_rua', e.target.value)} className="md:col-span-2" />
              <Input label="Nº" value={form.entrega_numero} onChange={e=>handleChange('entrega_numero', e.target.value)} />
              <Input label="Bairro" value={form.entrega_bairro} onChange={e=>handleChange('entrega_bairro', e.target.value)} />
              <Input label="Cidade" value={form.entrega_cidade} onChange={e=>handleChange('entrega_cidade', e.target.value)} className="md:col-span-2" />
              <Input label="Obs Local Entrega" value={form.entrega_obs} onChange={e=>handleChange('entrega_obs', e.target.value)} className="md:col-span-2" />
            </div>
          </div>

          <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 overflow-x-auto">
            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2"><ListTodo size={18}/> Lista de Itens (15 Linhas)</h3>
            <p className="text-xs text-gray-500 mb-2">Digite a descrição. Se o item existir no estoque, o Código e Unidade serão preenchidos automaticamente.</p>
            <div className="min-w-[700px]">
                <table className="w-full text-xs text-left border border-gray-700 rounded overflow-hidden">
                  <thead className="bg-gray-800 text-gray-400 uppercase">
                    <tr><th className="p-2 w-2/5">Descrição do item</th><th className="p-2 w-24 text-center">Cód. Insumo</th><th className="p-2 w-16 text-center">Un.</th><th className="p-2 w-20 text-center">Qtde</th><th className="p-2 w-1/4">Observações sobre itens</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {form.itens.map((item, idx) => (
                      <tr key={idx} className="bg-gray-900 hover:bg-gray-800/50 transition-colors">
                        <td className="p-1"><input list="produtos-list" value={item.descricao} onChange={e => handleItemChange(idx, 'descricao', e.target.value)} className="w-full bg-transparent border border-gray-700 rounded px-2 py-1 text-white outline-none focus:border-yellow-500" placeholder={`Item ${idx+1}`} /></td>
                        <td className="p-1"><input value={item.cod_insumo} onChange={e => handleItemChange(idx, 'cod_insumo', e.target.value)} className="w-full bg-transparent border border-gray-700 rounded px-2 py-1 text-center text-gray-400 outline-none" /></td>
                        <td className="p-1"><input value={item.un} onChange={e => handleItemChange(idx, 'un', e.target.value.toUpperCase())} className="w-full bg-transparent border border-gray-700 rounded px-2 py-1 text-center text-gray-400 outline-none" /></td>
                        <td className="p-1"><input type="number" value={item.qtde} onChange={e => handleItemChange(idx, 'qtde', e.target.value)} className="w-full bg-transparent border border-gray-700 rounded px-2 py-1 text-center text-yellow-500 font-bold outline-none focus:border-yellow-500" /></td>
                        <td className="p-1"><input value={item.obs} onChange={e => handleItemChange(idx, 'obs', e.target.value)} className="w-full bg-transparent border border-gray-700 rounded px-2 py-1 text-gray-400 outline-none" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800"><Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button><Button onClick={handleSaveClick} className="flex-1 !bg-green-600 !text-white"><CheckSquare className="w-4 h-4 mr-2"/> Fechar e Salvar Requisição</Button></div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// 13. VIEW: MAQUINÁRIO EXTERNO (LOCAÇÕES)
// ============================================================================

const LocacoesView = ({ locacoes, onSave, onDelete, showMsg }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const locacoesAtivas = (locacoes || []).filter(l => String(l.ativo) !== 'false').sort((a,b) => new Date(b.entry_date || 0) - new Date(a.entry_date || 0));

  const handleSaveLoc = async (data) => { await onSave(data); setShowForm(false); setEditingItem(null); };

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div><h2 className="text-lg font-bold text-white flex items-center gap-2"><Building2 className="text-yellow-500"/> Controlo de Equipamentos Alugados</h2><p className="text-xs text-gray-400 mt-1">Registe máquinas pesadas que entram na obra vindas de locadoras (ex: Locamix).</p></div>
        <Button onClick={() => { setEditingItem(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-1"/> Adicionar Máquina</Button>
      </div>

      {showForm && <LocacaoFormModal onClose={() => {setShowForm(false); setEditingItem(null);}} onSave={handleSaveLoc} initialData={editingItem} showMsg={showMsg}/>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locacoesAtivas.length === 0 ? ( <div className="col-span-full text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800"><Truck className="w-12 h-12 text-gray-600 mx-auto mb-3"/><p className="text-gray-500">Nenhum equipamento externo registado na obra.</p></div> ) : (
          locacoesAtivas.map(loc => {
            const statusColor = loc.status === 'ENTRADA' ? 'text-green-400 bg-green-900/20 border-green-800/50' : loc.status === 'DEVOLUCAO' ? 'text-blue-400 bg-blue-900/20 border-blue-800/50' : 'text-orange-400 bg-orange-900/20 border-orange-800/50';
            return (
              <Card key={loc.id} className="p-4 hover:border-yellow-600 transition flex flex-col h-full">
                <div className="flex justify-between items-start mb-3"><h3 className="text-white font-bold text-lg leading-tight line-clamp-2 pr-2">{loc.tool_name}</h3><span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${statusColor}`}>{loc.status || 'ENTRADA'}</span></div>
                <div className="space-y-1.5 flex-1 mt-2 text-sm">
                  <div className="flex justify-between border-b border-gray-800 pb-1.5"><span className="text-gray-500">Locadora</span><span className="text-white font-medium truncate ml-2">{loc.lending_company}</span></div>
                  <div className="flex justify-between border-b border-gray-800 pb-1.5"><span className="text-gray-500">Responsável</span><span className="text-gray-300 truncate ml-2">{loc.responsavel || '-'}</span></div>
                  <div className="flex justify-between pb-1.5"><span className="text-gray-500">Data Entrada</span><span className="text-yellow-500 font-mono">{formatBRDate(loc.entry_date)}</span></div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-800">
                  <Button variant="secondary" onClick={() => { setEditingItem(loc); setShowForm(true); }} className="!p-2 flex-1"><Edit size={16}/></Button>
                  <Button variant="danger" onClick={async () => { if(await showMsg("Excluir", `Remover ${loc.tool_name} do controlo?`, true)) onDelete(loc.id); }} className="!p-2 flex-1"><Trash2 size={16}/></Button>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
};

const LocacaoFormModal = ({ onClose, onSave, initialData, showMsg }) => {
  const [form, setForm] = useState(() => ({ id: initialData?.id || `LOC-${generateId()}`, tool_name: initialData?.tool_name || '', lending_company: initialData?.lending_company || '', responsavel: initialData?.responsavel || '', entry_date: initialData?.entry_date ? initialData.entry_date.split('T')[0] : getLocalISOString().slice(0,10), status: initialData?.status || 'ENTRADA', observacoes: initialData?.observacoes || '', ativo: true }));
  const handleChange = (f,v) => setForm(p => ({ ...p, [f]: v }));
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card title="Registo de Maquinário" className="max-w-lg w-full">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
        <div className="space-y-4">
          <Input label="Nome da Máquina / Equipamento" value={form.tool_name} onChange={e=>handleChange('tool_name', e.target.value)} required autoFocus />
          <div className="grid grid-cols-2 gap-4"><Input label="Fornecedor / Locadora" value={form.lending_company} onChange={e=>handleChange('lending_company', e.target.value)} required /><Input label="Responsável" value={form.responsavel} onChange={e=>handleChange('responsavel', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4"><Input type="date" label="Data de Entrada" value={form.entry_date} onChange={e=>handleChange('entry_date', e.target.value)} /><Select label="Status Atual" value={form.status} onChange={e=>handleChange('status', e.target.value)} options={['ENTRADA', 'TROCA', 'DEVOLUCAO']} /></div>
          <div><label className="block text-xs font-medium text-gray-400 mb-1">Observações (Nº Contrato, Condição...)</label><textarea value={form.observacoes} onChange={e=>handleChange('observacoes', e.target.value)} rows={2} className="w-full p-2 rounded-lg bg-gray-900 text-gray-100 border border-gray-700 outline-none focus:border-yellow-500" /></div>
          <div className="flex gap-3 pt-4 border-t border-gray-800"><Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button><Button onClick={() => { if(!form.tool_name) return showMsg("Erro", "Nome obrigatório"); onSave(form); }} className="flex-1 !bg-yellow-500"><Save className="w-4 h-4 mr-2"/> Guardar</Button></div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// 14. VIEW: FERRAMENTAS ALUGADAS (ALMOXARIFADO INTERNO)
// ============================================================================

const FerramentasAlugadasView = ({ ferramentas, emprestimos, onSaveFerr, onDeleteFerr, onSaveEmp, onUpdateEmp, showMsg }) => {
  const [activeTab, setActiveTab] = useState('CATALOGO');
  const [showForm, setShowForm] = useState(false);
  const [showSaidaForm, setShowSaidaForm] = useState(false);

  const ferramentasAtivas = (ferramentas || []).filter(f => String(f.ativo) !== 'false' && f.status !== 'INATIVO').sort((a,b)=>a.nome.localeCompare(b.nome));
  const emprestimosAbertos = (emprestimos || []).filter(e => e.status === 'ABERTO').sort((a,b)=>new Date(b.data_retirada)-new Date(a.data_retirada));
  
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between bg-gray-900 p-4 rounded-xl border border-gray-800 gap-3">
        <div className="flex gap-2 p-1 bg-gray-950 rounded-lg border border-gray-800">
          <button onClick={()=>setActiveTab('CATALOGO')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab==='CATALOGO'?'bg-yellow-500 text-gray-900 shadow':'text-gray-400 hover:text-white'}`}>Catálogo Interno</button>
          <button onClick={()=>setActiveTab('EM_USO')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab==='EM_USO'?'bg-yellow-500 text-gray-900 shadow':'text-gray-400 hover:text-white'}`}>Painel de Saídas ({emprestimosAbertos.length})</button>
        </div>
        <div className="flex gap-2">
          {activeTab==='CATALOGO' && <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1"/> Adicionar Ferramenta</Button>}
          {activeTab==='EM_USO' && <Button onClick={() => setShowSaidaForm(true)} className="!bg-blue-600 !text-white"><ArrowRightLeft className="w-4 h-4 mr-1"/> Registar Saída / Empréstimo</Button>}
        </div>
      </div>

      {showForm && <FerramentaFormModal onClose={()=>setShowForm(false)} onSave={d=>{onSaveFerr(d); setShowForm(false);}} showMsg={showMsg}/>}
      {showSaidaForm && <SaidaFormModal onClose={()=>setShowSaidaForm(false)} onSave={d=>{onSaveEmp(d); setShowSaidaForm(false);}} ferramentas={ferramentasAtivas.filter(f=>f.status==='DISPONIVEL')} showMsg={showMsg}/>}

      {activeTab === 'CATALOGO' ? (
        <div className="overflow-x-auto border border-gray-800 rounded-xl">
          <table className="w-full text-sm text-left text-gray-300"><thead className="bg-gray-800"><tr><th className="p-3">Nome / Modelo</th><th className="p-3">Patrimônio</th><th className="p-3 text-center">Status</th><th className="p-3 text-right">Ação</th></tr></thead>
          <tbody className="divide-y divide-gray-800/50">
            {ferramentasAtivas.length===0?(<tr><td colSpan="4" className="p-8 text-center text-gray-500">Sem ferramentas registadas no acervo.</td></tr>):(
              ferramentasAtivas.map(f => (
                <tr key={f.id} className="hover:bg-gray-800/30">
                  <td className="p-3 text-white font-bold">{f.nome}</td><td className="p-3 font-mono text-xs text-gray-500">{f.patrimonio||'-'}</td>
                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${f.status==='EMPRESTADO'?'bg-orange-900/30 text-orange-400 border border-orange-800':'bg-green-900/30 text-green-400 border border-green-800'}`}>{f.status}</span></td>
                  <td className="p-3 text-right"><button onClick={async()=>{if(await showMsg("Remover", `Inativar ${f.nome}?`, true)) onDeleteFerr(f.id);}} className="text-red-400 p-2 hover:bg-gray-800 rounded transition"><Trash2 size={16}/></button></td>
                </tr>
              ))
            )}
          </tbody></table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emprestimosAbertos.length===0?(<div className="col-span-full py-12 text-center bg-gray-900/50 rounded-xl border border-gray-800"><CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-2"/><p className="text-gray-500">Todas as ferramentas encontram-se na base.</p></div>):(
            emprestimosAbertos.map(emp => {
              const ferr = ferramentas.find(f=>f.id===emp.ferramenta_id);
              return (
                <Card key={emp.id} className="border-orange-800/30 bg-gray-900 p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-2"><h3 className="text-white font-bold">{ferr?.nome||'Desconhecida'}</h3><Clock size={16} className="text-orange-400"/></div>
                    <div className="text-sm text-gray-400 space-y-1"><p><strong className="text-gray-300">Retirou:</strong> {emp.retirado_por}</p><p><strong className="text-gray-300">Destino:</strong> {emp.locacao_retirada}</p><p className="text-xs font-mono mt-2 pt-2 border-t border-gray-800">Saída: {formatBRDate(emp.data_retirada)}</p></div>
                  </div>
                  <Button onClick={() => onUpdateEmp(emp.id, 'DEVOLVIDO')} className="w-full mt-4 !bg-green-800 hover:!bg-green-700 !text-green-100 !border-none"><ArrowDownCircle size={16} className="mr-2"/> Registar Devolução</Button>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  );
};

const FerramentaFormModal = ({onClose, onSave, showMsg}) => {
  const [f, setF] = useState({id: `FERR-${generateId()}`, nome: '', patrimonio: '', categoria: 'Ferramentas Manuais', status: 'DISPONIVEL', ativo: true});
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"><Card title="Nova Ferramenta" className="max-w-md w-full"><div className="space-y-4"><Input label="Nome da Ferramenta" value={f.nome} onChange={e=>setF({...f,nome:e.target.value})} autoFocus/><Input label="Nº de Patrimônio / Etiqueta" value={f.patrimonio} onChange={e=>setF({...f,patrimonio:e.target.value})}/><div className="flex gap-2 pt-4 border-t border-gray-800"><Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button><Button onClick={()=>{if(!f.nome)return showMsg("Erro","Nome obrigatório"); onSave(f);}} className="flex-1">Guardar</Button></div></div></Card></div>
  );
};

const SaidaFormModal = ({onClose, onSave, ferramentas, showMsg}) => {
  const [f, setF] = useState({id: `EMP-${generateId()}`, data_retirada: getLocalISOString(), ferramenta_id: '', retirado_por: '', locacao_retirada: '', status: 'ABERTO'});
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"><Card title="Registo de Saída (Empréstimo)" className="max-w-md w-full"><div className="space-y-4"><Select label="Selecionar Ferramenta Disponível" value={f.ferramenta_id} onChange={e=>setF({...f,ferramenta_id:e.target.value})} options={[{value:'',label:'Selecione...'}, ...ferramentas.map(x=>({value:x.id, label:x.nome}))]} /><Input label="Nome do Colaborador" value={f.retirado_por} onChange={e=>setF({...f,retirado_por:e.target.value})}/><Input label="Obra / Destino" value={f.locacao_retirada} onChange={e=>setF({...f,locacao_retirada:e.target.value})}/><div className="flex gap-2 pt-4 border-t border-gray-800"><Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button><Button onClick={()=>{if(!f.ferramenta_id || !f.retirado_por)return showMsg("Erro","Preencha ferramenta e responsável"); onSave(f);}} className="flex-1 !bg-blue-600 !text-white">Registar Saída</Button></div></div></Card></div>
  );
};

// ============================================================================
// 15. VIEW: INSUMOS CONTROLADOS (PBQP-H)
// ============================================================================

const InsumosControladosView = ({ produtos, onPrintLabel }) => {
  const rastreaveis = (produtos || []).filter(p => !!p.rastreavel && String(p.ativo) !== 'false').sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0));
  
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2"><ClipboardCheck className="text-purple-400"/> Matriz de Rastreabilidade (ISO/PBQP-H)</h2>
        <p className="text-sm text-gray-400">Todos os insumos estruturais com validação técnica de Lote, Validade e DNA obrigatório.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rastreaveis.length === 0 ? (<div className="col-span-full text-center py-10 bg-gray-900/30 rounded-xl border border-gray-800"><Tag className="w-10 h-10 text-gray-600 mx-auto mb-3"/><p className="text-gray-500">Não há insumos classificados como rastreáveis.</p></div>) : (
          rastreaveis.map(item => (
            <Card key={item.id} className="border-purple-900/30 bg-gray-900 p-0 overflow-hidden">
              <div className="p-4 border-b border-gray-800 bg-gray-800/30 flex justify-between items-center"><h3 className="font-bold text-white text-lg truncate pr-4">{item.nome}</h3><span className="bg-purple-900/50 text-purple-300 px-2.5 py-1 rounded text-[10px] font-black uppercase shrink-0">{item.dna_type || 'Geral'}</span></div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="block text-[10px] uppercase font-bold text-gray-600 mb-0.5">Lote / NF</span><span className="font-mono text-yellow-400">{item.lote || item.fornecedor_nf || 'Sem Identificador'}</span></div>
                <div><span className="block text-[10px] uppercase font-bold text-gray-600 mb-0.5">Validade Base</span><span className="text-gray-300">{formatBRDate(item.validade)}</span></div>
                <div className="col-span-2 bg-gray-950 p-3 rounded border border-gray-800">
                  <span className="block text-[10px] uppercase font-bold text-gray-600 mb-2">Especificações de DNA</span>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    {Object.entries(item.dna_payload || {}).map(([k,v]) => v ? <div key={k}><span className="text-gray-500">{k}:</span> {v}</div> : null)}
                    {Object.keys(item.dna_payload||{}).length===0 && <span className="text-gray-600 italic">Nenhum parâmetro extra preenchido.</span>}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-800/20 flex justify-between items-center border-t border-gray-800">
                <div className="text-gray-400 text-xs">Saldo: <strong className="text-white text-sm">{item.saldo_atual} {item.unidade}</strong></div>
                <Button onClick={() => onPrintLabel([item])} className="!p-1.5 !bg-gray-800 hover:!bg-gray-700 !text-gray-300 border border-gray-700" title="Imprimir Etiqueta"><PrinterIcon size={16}/></Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 17. VIEW: BACKUP E RESTAURAÇÃO
// ============================================================================

const BackupView = ({ produtos, movimentacoes, requisicoes, locacoes, ferramentas, emprestimos, desperdicios, showMsg }) => {
  const handleExport = () => {
    const data = { produtos, movimentacoes_estoque: movimentacoes, requisicoes, locacoes, ferramentas, emprestimos, desperdicios, exportDate: new Date().toISOString(), version: '6.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `backup-rmk1-almox-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if(!await showMsg("Alerta de Restauro", "Esta ação vai APAGAR o banco atual e substituir pelo ficheiro JSON. Continuar?", true)) return;
    try {
      const text = await file.text(); const data = JSON.parse(text);
      const cols = ['produtos', 'movimentacoes_estoque', 'requisicoes', 'locacoes', 'ferramentas', 'emprestimos', 'desperdicios'];
      for (const col of cols) { if (data[col]) { await AppDB.clearAll(col); for (const item of data[col]) { await AppDB.put(col, item); } } }
      await showMsg("Restauro Concluído", "O sistema vai ser recarregado."); window.location.reload();
    } catch (error) { showMsg('Erro no Backup', error.message); }
  };

  return (
    <div className="space-y-6">
      <Card title="Motor Base de Dados (IndexedDB FastSync)" icon={Database}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg text-center"><Package className="w-6 h-6 text-yellow-400 mx-auto mb-2" /><p className="text-xl font-bold text-white">{produtos?.length || 0}</p><p className="text-[10px] uppercase text-gray-400">Produtos</p></div>
          <div className="bg-gray-800 p-4 rounded-lg text-center"><ArrowRightLeft className="w-6 h-6 text-blue-400 mx-auto mb-2" /><p className="text-xl font-bold text-white">{movimentacoes?.length || 0}</p><p className="text-[10px] uppercase text-gray-400">Auditoria Mov.</p></div>
          <div className="bg-gray-800 p-4 rounded-lg text-center"><Building2 className="w-6 h-6 text-green-400 mx-auto mb-2" /><p className="text-xl font-bold text-white">{locacoes?.length || 0}</p><p className="text-[10px] uppercase text-gray-400">Locações Ext.</p></div>
          <div className="bg-gray-800 p-4 rounded-lg text-center"><Wrench className="w-6 h-6 text-purple-400 mx-auto mb-2" /><p className="text-xl font-bold text-white">{ferramentas?.length || 0}</p><p className="text-[10px] uppercase text-gray-400">Ferramentas</p></div>
          <div className="bg-gray-800 p-4 rounded-lg text-center"><AlertOctagon className="w-6 h-6 text-red-400 mx-auto mb-2" /><p className="text-xl font-bold text-white">{desperdicios?.length || 0}</p><p className="text-[10px] uppercase text-gray-400">Desperdícios</p></div>
        </div>
      </Card>

      <Card title="Backup Segurança" icon={Cloud}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center"><Download className="w-12 h-12 text-blue-400 mx-auto mb-4" /><h3 className="text-white font-semibold mb-2">Exportar Imagem Global</h3><p className="text-sm text-gray-400 mb-4">Salvar JSON com integridade estrutural.</p><Button onClick={handleExport} className="w-full !bg-blue-600 !text-white"><Download className="w-4 h-4 mr-2"/> Download DB</Button></div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center"><Upload className="w-12 h-12 text-green-400 mx-auto mb-4" /><h3 className="text-white font-semibold mb-2">Restaurar Ficheiro JSON</h3><p className="text-sm text-gray-400 mb-4">Substituição destrutiva da base atual.</p><label className="cursor-pointer block"><input type="file" accept=".json" onChange={handleImport} className="hidden" /><Button variant="secondary" className="w-full !bg-gray-700 hover:!bg-gray-600"><Upload className="w-4 h-4 mr-2"/> Fazer Upload</Button></label></div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// 18. TELA DE LOGIN
// ============================================================================

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'lmalmox') onLogin({name: 'Admin', role: 'admin'});
    else if (password === 'aud123') onLogin({name: 'Auditor Externo', role: 'auditor'});
    else { setError(true); setTimeout(() => setError(false), 2000); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-yellow-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.3)]"><Package className="w-10 h-10 text-gray-900"/></div>
          <h1 className="text-4xl font-black text-white tracking-tighter">{SYSTEM_NAME}</h1>
          <p className="text-yellow-500 font-mono text-xs tracking-[0.2em] mt-2 uppercase">SaaS Logística & Obras</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
          <div className="mb-6"><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password de Acesso</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-gray-950 text-white font-mono text-xl tracking-[0.3em] text-center py-4 rounded-xl border ${error ? 'border-red-500' : 'border-gray-800'} focus:border-yellow-500 focus:outline-none transition-colors shadow-inner`} placeholder="••••" autoFocus /></div></div>
          <Button type="submit" className="w-full py-4 uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]"><LogIn className="w-5 h-5 mr-2"/> Iniciar Sessão</Button>
          {error && <p className="text-red-400 text-xs font-bold text-center mt-4 animate-pulse uppercase tracking-wider">Acesso Recusado!</p>}
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 19. COMPONENTE PRINCIPAL APP
// ============================================================================

export default function App() {
  const [user, setUser] = useState(() => { try { const u = sessionStorage.getItem('rmk_usr'); return u ? JSON.parse(u) : null; } catch { return null; } });
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isLoading, setIsLoading] = useState(true);
  const [dbData, setDbData] = useState({ produtos: [], ferramentas: [], emprestimos: [], movimentacoes_estoque: [], requisicoes: [], locacoes: [], desperdicios: [] });
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const showMsg = useCallback((title, message, isConfirm = false) => {
      return new Promise((resolve) => { setDialogContext({ title, message, isConfirm, resolve }); });
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, f, e, m, r, l, d] = await Promise.all([AppDB.getAll('produtos'), AppDB.getAll('ferramentas'), AppDB.getAll('emprestimos'), AppDB.getAll('movimentacoes_estoque'), AppDB.getAll('requisicoes'), AppDB.getAll('locacoes'), AppDB.getAll('desperdicios')]);
      setDbData({ produtos: p||[], ferramentas: f||[], emprestimos: e||[], movimentacoes_estoque: m||[], requisicoes: r||[], locacoes: l||[], desperdicios: d||[] });
    } catch (error) { console.error('Data Load Error', error); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { if (user) loadInitialData(); }, [user, loadInitialData]);
  
  useEffect(() => { document.title = SYSTEM_NAME; }, []);

  const handleLogin = (u) => { sessionStorage.setItem('rmk_usr', JSON.stringify(u)); setUser(u); };
  const handleLogout = async () => { if(await showMsg("Sair", "Terminar a sessão local atual?", true)) { sessionStorage.removeItem('rmk_usr'); window.location.reload(); } };

  // Handlers Universal Puts
  const genericSave = async (col, data) => { await AppDB.put(col, data); await loadInitialData(); };
  const genericDelete = async (col, id) => { await AppDB.delete(col, id); await loadInitialData(); };

  const handleSaveProduto = async ({produto, movimentacao}) => {
      await AppDB.put('produtos', produto);
      if (movimentacao) {
          await AppDB.put('movimentacoes_estoque', movimentacao);
      }
      await loadInitialData();
  };

  const handleXmlImport = async ({ xmlData, selectedProducts, fornecedor, numeroNF, dataEmissao }) => {
    let imported = 0;
    for (const prod of selectedProducts) {
      if(!prod.descricao) continue;
      const novoProduto = { id: `PROD-${generateId()}`, sku: prod.codigo || `SKU-${generateId()}`, nome: prod.descricao, categoria: CATEGORIAS_PADRAO[0], unidade: prod.unidade || 'UN', saldo_atual: prod.qtd, qtd_inicial: prod.qtd, estoque_minimo: 5, local_armazenamento: AREAS_ESTOCAGEM[0], empreiteira: '', fornecedor_nf: `${fornecedor} - NF ${numeroNF}`, preco_unitario: prod.valorUnitario, ativo: true, rastreavel: false };
      await AppDB.put('produtos', novoProduto);
      await AppDB.put('movimentacoes_estoque', { id: `MOV-${generateId()}`, data: getLocalISOString(), tipo: 'ENTRADA', sku: novoProduto.id, qtd: prod.qtd, origem: `NF-e ${numeroNF}`, destino: AREAS_ESTOCAGEM[0], obs: `Lançado via XML Nativo - ${fornecedor}` });
      imported++;
    }
    await loadInitialData();
    if(imported>0) showMsg("Sucesso", `${imported} insumos adicionados ao banco com sucesso!`);
  };

  const handlePrintMovimentacoes = (movs) => {
    const dataForPrint = movs.map(m => {
        const p = dbData.produtos.find(x => x.id === m.sku || x.sku === m.sku);
        return {
            data_fmt: formatBRDate(m.data), tipo: m.tipo, produto: p?.nome || m.sku,
            empreiteira: p?.empreiteira || '-', qtd: m.qtd, origem_destino: m.tipo === 'ENTRADA' ? m.origem : m.destino, obs: m.obs || '-'
        };
    });
    generatePDF('Relatório de Movimentações de Estoque', [
        {header: 'Data', dataKey: 'data_fmt'}, {header: 'Tipo', dataKey: 'tipo'}, {header: 'Produto', dataKey: 'produto'},
        {header: 'Empreiteira', dataKey: 'empreiteira'}, {header: 'Qtd', dataKey: 'qtd'}, {header: 'Origem/Destino', dataKey: 'origem_destino'},
        {header: 'Obs', dataKey: 'obs'}
    ], dataForPrint, showMsg);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="relative mb-6"><div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div><Database className="w-6 h-6 text-yellow-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/></div>
      <p className="text-gray-400 font-mono text-xs uppercase tracking-widest animate-pulse">Lendo motor IndexedDB...</p>
    </div>
  );

  const tabs = [
    { id: 'DASHBOARD', label: 'Painel', icon: LayoutDashboard },
    { id: 'ESTOQUE', label: 'Estoque Central', icon: Package },
    { id: 'MOVIMENTACOES', label: 'Auditoria Mov.', icon: ArrowRightLeft },
    { id: 'DESPERDICIOS', label: 'Perdas & Desperdícios', icon: AlertOctagon },
    { id: 'REQUISICOES', label: 'Requisições', icon: FileText },
    { id: 'LOCACOES', label: 'Maquinário Ext.', icon: Building2 },
    { id: 'FERRAMENTAS', label: 'Almoxarifado', icon: Wrench },
    { id: 'INSUMOS', label: 'Rastreabilidade', icon: ClipboardCheck },
    { id: 'BACKUP', label: 'DB / Export', icon: Cloud }
  ];

  const adminTabs = user.role === 'admin' ? tabs : tabs;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex overflow-hidden">
        {dialogContext && <DialogModal {...dialogContext} onConfirm={() => { dialogContext.resolve(true); setDialogContext(null); }} onCancel={() => { dialogContext.resolve(false); setDialogContext(null); }} />}
        
        {/* Sidebar Edge/Mobile */}
        <div className={`fixed inset-0 bg-black/80 z-40 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
        <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-950 border-r border-gray-800 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-gray-800 flex justify-center items-center h-20 bg-gray-900/50"><img src={LOGO_URL} onError={(e) => e.target.src = LOGO_FALLBACK} alt="Logo" className="h-10 object-contain filter brightness-0 invert" /></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5 mt-2">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 ml-3 mt-2">Módulos do Sistema</p>
            {adminTabs.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                <t.icon size={18} className={activeTab === t.id ? 'text-gray-900' : 'opacity-70'}/> {t.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-800 bg-gray-900/30">
            <Button variant="outline" onClick={() => setIsXmlModalOpen(true)} className="w-full !p-3 !bg-blue-900/20 !border-blue-800 !text-blue-400 hover:!bg-blue-900/40 text-xs mb-3"><FileCode size={16} className="mr-2"/> Importar XML Nativo</Button>
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700"><User size={14} className="text-gray-400"/></div>
              <div className="flex-1 min-w-0"><p className="text-xs font-bold text-white truncate">{user.name}</p><p className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> PWA Ativo</p></div>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-400 p-1"><LogOut size={16}/></button>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black/20">
          <header className="lg:hidden bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3"><button onClick={() => setIsSidebarOpen(true)} className="text-yellow-500 p-1 bg-gray-800 rounded"><Menu size={24}/></button><span className="font-bold text-white text-lg tracking-tight">{SYSTEM_NAME}</span></div>
            <button onClick={() => setIsXmlModalOpen(true)} className="w-8 h-8 rounded bg-blue-900/30 text-blue-400 flex items-center justify-center border border-blue-800/50"><FileCode size={16}/></button>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-32">
            <div className="max-w-[1400px] mx-auto">
              <div className="mb-6 hidden lg:block"><h1 className="text-3xl font-black text-white tracking-tighter uppercase">{adminTabs.find(t=>t.id===activeTab)?.label || 'Sistema'}</h1><div className="h-1 w-16 bg-yellow-500 mt-2 rounded"></div></div>
              
              {activeTab === 'DASHBOARD' && <DashboardView produtos={dbData.produtos} locacoes={dbData.locacoes} ferramentas={dbData.ferramentas} emprestimos={dbData.emprestimos} movimentacoes={dbData.movimentacoes_estoque} desperdicios={dbData.desperdicios} setActiveTab={setActiveTab} />}
              {activeTab === 'ESTOQUE' && <EstoqueView produtos={dbData.produtos} onSave={handleSaveProduto} onDelete={id=>genericDelete('produtos', id)} onPrintLowStock={p=>printLowStockReport(p, 'ALL', showMsg)} onPrintLabel={i=>printBulkLabels(i, showMsg)} showMsg={showMsg} />}
              {activeTab === 'MOVIMENTACOES' && <MovimentacoesView movimentacoes={dbData.movimentacoes_estoque} produtos={dbData.produtos} onSave={m=>genericSave('movimentacoes_estoque', m)} onPrint={handlePrintMovimentacoes} showMsg={showMsg} />}
              {activeTab === 'DESPERDICIOS' && <DesperdiciosView desperdicios={dbData.desperdicios} produtos={dbData.produtos} onSave={d=>genericSave('desperdicios', d)} showMsg={showMsg} />}
              {activeTab === 'REQUISICOES' && <RequisicoesView requisicoes={dbData.requisicoes} produtos={dbData.produtos} onSave={r=>genericSave('requisicoes', r)} onUpdate={r=>genericSave('requisicoes', r)} showMsg={showMsg} />}
              {activeTab === 'LOCACOES' && <LocacoesView locacoes={dbData.locacoes} onSave={l=>genericSave('locacoes', l)} onDelete={id=>genericDelete('locacoes', id)} showMsg={showMsg}/>}
              {activeTab === 'FERRAMENTAS' && <FerramentasAlugadasView ferramentas={dbData.ferramentas} emprestimos={dbData.emprestimos} onSaveFerr={f=>genericSave('ferramentas', f)} onDeleteFerr={id=>genericDelete('ferramentas', id)} onSaveEmp={e=>genericSave('emprestimos', e)} onUpdateEmp={(id, st)=>genericSave('emprestimos', {...dbData.emprestimos.find(x=>x.id===id), status: st, data_devolucao: getLocalISOString()})} showMsg={showMsg}/>}
              {activeTab === 'INSUMOS' && <InsumosControladosView produtos={dbData.produtos} onPrintLabel={i=>printBulkLabels(i, showMsg)}/>}
              {activeTab === 'BACKUP' && <BackupView produtos={dbData.produtos} movimentacoes={dbData.movimentacoes_estoque} requisicoes={dbData.requisicoes} locacoes={dbData.locacoes} ferramentas={dbData.ferramentas} emprestimos={dbData.emprestimos} desperdicios={dbData.desperdicios} showMsg={showMsg} />}
            </div>
          </div>
        </main>
      </div>
      
      <XMLImportModal isOpen={isXmlModalOpen} onClose={() => setIsXmlModalOpen(false)} onDataExtracted={handleXmlImport} showMsg={showMsg} />
    </ErrorBoundary>
  );
}