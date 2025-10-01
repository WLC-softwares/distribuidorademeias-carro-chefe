'use client';

import { createProductAction, updateProductAction } from '@/controllers';
import type { CategoriaProduto, CreateProductDTO, Product } from '@/models';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { Select, SelectItem } from '@heroui/select';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProductDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product?: Product | null;
}

interface ImageForm {
    url: string;
    alt: string;
    principal: boolean;
}

const CATEGORIAS: { value: CategoriaProduto; label: string }[] = [
    { value: 'MEIAS_MASCULINAS', label: 'Meias Masculinas' },
    { value: 'MEIAS_FEMININAS', label: 'Meias Femininas' },
    { value: 'MEIAS_INFANTIS', label: 'Meias Infantis' },
    { value: 'MEIAS_ESPORTIVAS', label: 'Meias Esportivas' },
    { value: 'MEIAS_SOCIAIS', label: 'Meias Sociais' },
    { value: 'MEIAS_TERMICAS', label: 'Meias Térmicas' },
    { value: 'ACESSORIOS', label: 'Acessórios' },
    { value: 'OUTROS', label: 'Outros' },
];

export function ProductDrawer({ isOpen, onClose, onSuccess, product }: ProductDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '',
        quantidade: '',
        categoria: '' as CategoriaProduto,
        sku: '',
    });
    const [images, setImages] = useState<ImageForm[]>([]);

    useEffect(() => {
        if (product) {
            setFormData({
                nome: product.nome,
                descricao: product.descricao || '',
                preco: product.preco.toString(),
                quantidade: product.quantidade.toString(),
                categoria: product.categoria,
                sku: product.sku || '',
            });
            setImages(
                product.imagens?.map((img) => ({
                    url: img.url,
                    alt: img.alt || '',
                    principal: img.principal,
                })) || []
            );
        } else {
            resetForm();
        }
    }, [product, isOpen]);

    const resetForm = () => {
        setFormData({
            nome: '',
            descricao: '',
            preco: '',
            quantidade: '',
            categoria: '' as CategoriaProduto,
            sku: '',
        });
        setImages([]);
    };

    const handleAddImage = () => {
        setImages([...images, { url: '', alt: '', principal: images.length === 0 }]);
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        // Se remover a imagem principal, tornar a primeira como principal
        if (images[index].principal && newImages.length > 0) {
            newImages[0].principal = true;
        }
        setImages(newImages);
    };

    const handleImageChange = (index: number, field: keyof ImageForm, value: string | boolean) => {
        const newImages = [...images];
        if (field === 'principal' && value === true) {
            // Desmarcar todas as outras como principal
            newImages.forEach((img, i) => {
                img.principal = i === index;
            });
        } else {
            newImages[index] = { ...newImages[index], [field]: value };
        }
        setImages(newImages);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nome || !formData.preco || !formData.quantidade || !formData.categoria) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        setLoading(true);

        try {
            const data: CreateProductDTO = {
                nome: formData.nome,
                descricao: formData.descricao || undefined,
                preco: parseFloat(formData.preco),
                quantidade: parseInt(formData.quantidade),
                categoria: formData.categoria,
                sku: formData.sku || undefined,
                imagens: images
                    .filter((img) => img.url)
                    .map((img, index) => ({
                        url: img.url,
                        alt: img.alt || undefined,
                        ordem: index + 1,
                        principal: img.principal,
                    })),
            };

            if (product) {
                await updateProductAction(product.id, data);
            } else {
                await createProductAction(data);
            }

            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            alert('Erro ao salvar produto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
            classNames={{
                wrapper: 'items-end sm:items-center justify-end',
                base: 'h-full sm:h-auto sm:max-h-[90vh] m-0 sm:m-4 rounded-l-2xl sm:rounded-2xl',
            }}
        >
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {product ? 'Editar Produto' : 'Adicionar Produto'}
                        </h2>
                        <p className="text-sm text-gray-600 font-normal">
                            {product
                                ? 'Atualize as informações do produto'
                                : 'Preencha os dados do novo produto'}
                        </p>
                    </ModalHeader>
                    <ModalBody className="py-6">
                        <div className="space-y-6">
                            {/* Informações Básicas */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Informações Básicas
                                </h3>
                                <div className="space-y-4">
                                    <Input
                                        label="Nome do Produto"
                                        placeholder="Ex: Meia Social Preta"
                                        value={formData.nome}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, nome: value })
                                        }
                                        isRequired
                                        variant="bordered"
                                    />

                                    <Textarea
                                        label="Descrição"
                                        placeholder="Descrição detalhada do produto"
                                        value={formData.descricao}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, descricao: value })
                                        }
                                        variant="bordered"
                                        minRows={3}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="SKU"
                                            placeholder="Ex: MSP-001"
                                            value={formData.sku}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, sku: value })
                                            }
                                            variant="bordered"
                                        />

                                        <Select
                                            label="Categoria"
                                            placeholder="Selecione uma categoria"
                                            selectedKeys={formData.categoria ? [formData.categoria] : []}
                                            onSelectionChange={(keys) => {
                                                const selected = Array.from(keys)[0] as CategoriaProduto;
                                                setFormData({ ...formData, categoria: selected });
                                            }}
                                            isRequired
                                            variant="bordered"
                                        >
                                            {CATEGORIAS.map((cat) => (
                                                <SelectItem key={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Preço"
                                            placeholder="0.00"
                                            value={formData.preco}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, preco: value })
                                            }
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            isRequired
                                            variant="bordered"
                                            startContent={
                                                <span className="text-default-400 text-sm">R$</span>
                                            }
                                        />

                                        <Input
                                            label="Quantidade em Estoque"
                                            placeholder="0"
                                            value={formData.quantidade}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, quantidade: value })
                                            }
                                            type="number"
                                            min="0"
                                            isRequired
                                            variant="bordered"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Imagens */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Imagens</h3>
                                    <Button
                                        type="button"
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        onClick={handleAddImage}
                                    >
                                        Adicionar Imagem
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2 items-start p-4 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    label="URL da Imagem"
                                                    placeholder="https://exemplo.com/imagem.jpg"
                                                    value={image.url}
                                                    onValueChange={(value) =>
                                                        handleImageChange(index, 'url', value)
                                                    }
                                                    variant="bordered"
                                                    size="sm"
                                                />
                                                <Input
                                                    label="Texto Alternativo"
                                                    placeholder="Descrição da imagem"
                                                    value={image.alt}
                                                    onValueChange={(value) =>
                                                        handleImageChange(index, 'alt', value)
                                                    }
                                                    variant="bordered"
                                                    size="sm"
                                                />
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={image.principal}
                                                        onChange={(e) =>
                                                            handleImageChange(
                                                                index,
                                                                'principal',
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm text-gray-600">
                                                        Imagem Principal
                                                    </span>
                                                </label>
                                            </div>
                                            <Button
                                                type="button"
                                                isIconOnly
                                                size="sm"
                                                color="danger"
                                                variant="light"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                    {images.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            Nenhuma imagem adicionada
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="border-t border-gray-200">
                        <Button variant="flat" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button
                            color="warning"
                            type="submit"
                            isLoading={loading}
                            className="bg-yellow-400 hover:bg-yellow-500 font-semibold"
                        >
                            {product ? 'Atualizar' : 'Adicionar'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
