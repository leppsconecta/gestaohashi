import { supabase } from '../lib/supabase';

// ============ TYPES ============
export interface InsumoDb {
    id: string;
    nome: string;
    unidade: string;
    custo_unitario: number;
    created_at?: string;
}

export interface CategoriaDb {
    id: string;
    nome: string;
    created_at?: string;
}

export interface PratoDb {
    id: string;
    nome: string;
    categoria_id: string | null;
    custo_total: number;
    preco_venda: number;
    modo_preparo: string | null;
    foto_url: string | null;
    rendimento: number;
    unidade_rendimento: string;
    created_at?: string;
    updated_at?: string;
}

export interface PratoIngredienteDb {
    id?: string;
    prato_id: string;
    insumo_id: string;
    quantidade: number;
    custo_calculado: number;
}

// ============ INSUMOS ============
export async function getInsumos(): Promise<InsumoDb[]> {
    const { data, error } = await supabase
        .schema('gestaohashi')
        .from('insumos')
        .select('*')
        .order('nome');

    if (error) throw error;
    return data || [];
}

export async function createInsumo(insumo: Omit<InsumoDb, 'id' | 'created_at'>): Promise<InsumoDb> {
    const { data, error } = await supabase
        .schema('gestaohashi')
        .from('insumos')
        .insert(insumo)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateInsumo(id: string, insumo: Partial<InsumoDb>): Promise<InsumoDb> {
    const { data, error } = await supabase
        .schema('gestaohashi')
        .from('insumos')
        .update(insumo)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteInsumo(id: string): Promise<void> {
    const { error } = await supabase
        .schema('gestaohashi')
        .from('insumos')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ CATEGORIAS ============
export async function getCategorias(): Promise<CategoriaDb[]> {
    const { data, error } = await supabase
        .schema('gestaohashi')
        .from('categorias_prato')
        .select('*')
        .order('nome');

    if (error) throw error;
    return data || [];
}

export async function createCategoria(categoria: Omit<CategoriaDb, 'id' | 'created_at'>): Promise<CategoriaDb> {
    const { data, error } = await supabase
        .schema('gestaohashi')
        .from('categorias_prato')
        .insert(categoria)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCategoria(id: string, categoria: Partial<CategoriaDb>): Promise<CategoriaDb> {
    const { data, error } = await supabase
        .schema('gestaohashi')
        .from('categorias_prato')
        .update(categoria)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCategoria(id: string): Promise<void> {
    const { error } = await supabase
        .schema('gestaohashi')
        .from('categorias_prato')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ PRATOS ============
export async function getPratos(): Promise<PratoDb[]> {
    const { data, error } = await supabase
        .schema('gestaohashi')
        .from('pratos')
        .select('*')
        .order('nome');

    if (error) throw error;
    return data || [];
}

export async function getPratoIngredientes(pratoId: string): Promise<PratoIngredienteDb[]> {
    const { data, error } = await supabase
        .schema('gestaohashi')
        .from('prato_ingredientes')
        .select('*')
        .eq('prato_id', pratoId);

    if (error) throw error;
    return data || [];
}

export async function getAllPratosWithIngredientes(): Promise<(PratoDb & { ingredientes: PratoIngredienteDb[] })[]> {
    const pratos = await getPratos();
    const result = await Promise.all(
        pratos.map(async (prato) => {
            const ingredientes = await getPratoIngredientes(prato.id);
            return { ...prato, ingredientes };
        })
    );
    return result;
}

export async function createPrato(
    prato: Omit<PratoDb, 'id' | 'created_at' | 'updated_at'>,
    ingredientes: Omit<PratoIngredienteDb, 'id' | 'prato_id'>[]
): Promise<PratoDb> {
    // Insert prato
    const { data: pratoData, error: pratoError } = await supabase
        .schema('gestaohashi')
        .from('pratos')
        .insert(prato)
        .select()
        .single();

    if (pratoError) throw pratoError;

    // Insert ingredientes
    if (ingredientes.length > 0) {
        const ingredientesWithPratoId = ingredientes.map(ing => ({
            ...ing,
            prato_id: pratoData.id
        }));

        const { error: ingError } = await supabase
            .schema('gestaohashi')
            .from('prato_ingredientes')
            .insert(ingredientesWithPratoId);

        if (ingError) throw ingError;
    }

    return pratoData;
}

export async function updatePrato(
    id: string,
    prato: Partial<PratoDb>,
    ingredientes?: Omit<PratoIngredienteDb, 'id' | 'prato_id'>[]
): Promise<PratoDb> {
    // Update prato
    const { data: pratoData, error: pratoError } = await supabase
        .schema('gestaohashi')
        .from('pratos')
        .update({ ...prato, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (pratoError) throw pratoError;

    // Update ingredientes if provided
    if (ingredientes !== undefined) {
        // Delete old ingredientes
        await supabase
            .schema('gestaohashi')
            .from('prato_ingredientes')
            .delete()
            .eq('prato_id', id);

        // Insert new ingredientes
        if (ingredientes.length > 0) {
            const ingredientesWithPratoId = ingredientes.map(ing => ({
                ...ing,
                prato_id: id
            }));

            const { error: ingError } = await supabase
                .schema('gestaohashi')
                .from('prato_ingredientes')
                .insert(ingredientesWithPratoId);

            if (ingError) throw ingError;
        }
    }

    return pratoData;
}

export async function deletePrato(id: string): Promise<void> {
    // Ingredientes are cascade deleted
    const { error } = await supabase
        .schema('gestaohashi')
        .from('pratos')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============ IMAGE UPLOAD ============
export async function uploadPratoImage(pratoId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pratoId}_${Date.now()}.${fileExt}`;
    const filePath = `hashi_express/ficha_tecnica/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('midias')
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('midias')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export async function deletePratoImage(fotoUrl: string): Promise<void> {
    if (!fotoUrl) return;

    // Extract path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/midias/hashi_express/ficha_tecnica/xxx.jpg
    const pathMatch = fotoUrl.match(/\/midias\/(.+)$/);
    if (!pathMatch) return;

    const filePath = pathMatch[1];

    await supabase.storage
        .from('midias')
        .remove([filePath]);
}

export async function deletePratoWithImage(id: string, fotoUrl?: string): Promise<void> {
    // Delete image from storage first
    if (fotoUrl) {
        try {
            await deletePratoImage(fotoUrl);
        } catch (err) {
            console.error('Error deleting prato image:', err);
        }
    }

    // Then delete prato (ingredientes are cascade deleted)
    const { error } = await supabase
        .schema('gestaohashi')
        .from('pratos')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
