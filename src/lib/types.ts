export type Categoria = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  sortOrder?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Produto = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price?: number | null;
  promoPrice?: number | null;
  imageUrl?: string | null;
  brand?: string | null;
  volume?: string | null;
  alcoholContent?: string | null;
  temperature?: string | null;
  inStock?: boolean | null;
  featured?: boolean | null;
  bestSeller?: boolean | null;
  isNew?: boolean | null;
  sortOrder?: number | null;
  categoryId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  category?: Categoria | null;
};

export type ItemCarrinho = {
  produtoId: string;
  slug: string;
  nome: string;
  imagem?: string | null;
  precoUnitario: number;
  quantidade: number;
};

export type EnderecoEntrega = {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
};

export type DadosCliente = {
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
};
