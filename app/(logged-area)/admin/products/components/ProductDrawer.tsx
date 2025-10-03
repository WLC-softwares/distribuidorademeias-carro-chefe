"use client";

import type { CreateProductDTO, Product, ProductCategory } from "@/models";

import { Button } from "@heroui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/drawer";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Package, X } from "lucide-react";
import { useEffect, useState } from "react";

import { createProductAction, updateProductAction } from "@/controllers";

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

interface ImageForm {
  url: string;
  alt: string;
  primary: boolean;
}

const CATEGORIAS: { value: ProductCategory; label: string }[] = [
  { value: "MENS_SOCKS", label: "Meias Masculinas" },
  { value: "WOMENS_SOCKS", label: "Meias Femininas" },
  { value: "KIDS_SOCKS", label: "Meias Infantis" },
  { value: "SPORTS_SOCKS", label: "Meias Esportivas" },
  { value: "DRESS_SOCKS", label: "Meias Sociais" },
  { value: "THERMAL_SOCKS", label: "Meias Térmicas" },
  { value: "ACCESSORIES", label: "Acessórios" },
  { value: "OTHER", label: "Outros" },
];

export function ProductDrawer({
  isOpen,
  onClose,
  onSuccess,
  product,
}: ProductDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    retailPrice: "",
    wholesalePrice: "",
    quantity: "",
    category: "" as ProductCategory,
    sku: "",
  });
  const [images, setImages] = useState<ImageForm[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        retailPrice: product.retailPrice.toString(),
        wholesalePrice: product.wholesalePrice.toString(),
        quantity: product.quantity.toString(),
        category: product.category,
        sku: product.sku || "",
      });
      setImages(
        product.images?.map((img) => ({
          url: img.url,
          alt: img.alt || "",
          primary: img.primary,
        })) || [],
      );
    } else {
      resetForm();
    }
  }, [product, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      retailPrice: "",
      wholesalePrice: "",
      quantity: "",
      category: "" as ProductCategory,
      sku: "",
    });
    setImages([]);
  };

  const handleAddImage = () => {
    setImages([
      ...images,
      { url: "", alt: "", primary: images.length === 0 },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);

    // If removing primary image, make first image primary
    if (images[index].primary && newImages.length > 0) {
      newImages[0].primary = true;
    }
    setImages(newImages);
  };

  const handleImageChange = (
    index: number,
    field: keyof ImageForm,
    value: string | boolean,
  ) => {
    const newImages = [...images];

    if (field === "primary" && value === true) {
      // Unmark all others as primary
      newImages.forEach((img, i) => {
        img.primary = i === index;
      });
    } else {
      newImages[index] = { ...newImages[index], [field]: value };
    }
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.retailPrice ||
      !formData.wholesalePrice ||
      !formData.quantity ||
      !formData.category
    ) {
      alert("Preencha todos os campos obrigatórios");

      return;
    }

    setLoading(true);

    try {
      const data: CreateProductDTO = {
        name: formData.name,
        description: formData.description || undefined,
        retailPrice: parseFloat(formData.retailPrice),
        wholesalePrice: parseFloat(formData.wholesalePrice),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        sku: formData.sku || undefined,
        images: images
          .filter((img) => img.url)
          .map((img, index) => ({
            url: img.url,
            alt: img.alt || undefined,
            order: index + 1,
            primary: img.primary,
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
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" size="lg" onClose={onClose}>
      <DrawerContent>
        <form onSubmit={handleSubmit}>
          <DrawerHeader className="flex items-center gap-2 border-b border-gray-200">
            <Package size={20} />
            <div>
              <h2 className="text-xl font-semibold">
                {product ? "Editar Produto" : "Adicionar Produto"}
              </h2>
              <p className="text-sm text-gray-500 font-normal">
                {product
                  ? "Atualize as informações do produto"
                  : "Preencha os dados do novo produto"}
              </p>
            </div>
          </DrawerHeader>
          <DrawerBody className="p-4">
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Informações Básicas
                </h3>
                <div className="space-y-4">
                  <Input
                    isRequired
                    label="Nome do Produto"
                    placeholder="Ex: Meia Social Preta"
                    value={formData.name}
                    variant="bordered"
                    onValueChange={(value) =>
                      setFormData({ ...formData, name: value })
                    }
                  />

                  <Textarea
                    label="Descrição"
                    minRows={3}
                    placeholder="Descrição detalhada do produto"
                    value={formData.description}
                    variant="bordered"
                    onValueChange={(value) =>
                      setFormData({ ...formData, description: value })
                    }
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="SKU"
                      placeholder="Ex: MSP-001"
                      value={formData.sku}
                      variant="bordered"
                      onValueChange={(value) =>
                        setFormData({ ...formData, sku: value })
                      }
                    />

                    <Select
                      isRequired
                      label="Categoria"
                      placeholder="Selecione uma categoria"
                      selectedKeys={
                        formData.category ? [formData.category] : []
                      }
                      variant="bordered"
                      onSelectionChange={(keys) => {
                        const selected = Array.from(
                          keys,
                        )[0] as ProductCategory;

                        setFormData({ ...formData, category: selected });
                      }}
                    >
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      isRequired
                      label="Preço Varejo"
                      min="0"
                      placeholder="0.00"
                      startContent={
                        <span className="text-default-400 text-sm">R$</span>
                      }
                      step="0.01"
                      type="number"
                      value={formData.retailPrice}
                      variant="bordered"
                      onValueChange={(value) =>
                        setFormData({ ...formData, retailPrice: value })
                      }
                    />

                    <Input
                      isRequired
                      label="Preço Atacado"
                      min="0"
                      placeholder="0.00"
                      startContent={
                        <span className="text-default-400 text-sm">R$</span>
                      }
                      step="0.01"
                      type="number"
                      value={formData.wholesalePrice}
                      variant="bordered"
                      onValueChange={(value) =>
                        setFormData({ ...formData, wholesalePrice: value })
                      }
                    />
                  </div>

                  <Input
                    isRequired
                    label="Quantidade em Estoque"
                    min="0"
                    placeholder="0"
                    type="number"
                    value={formData.quantity}
                    variant="bordered"
                    onValueChange={(value) =>
                      setFormData({ ...formData, quantity: value })
                    }
                  />
                </div>
              </div>

              {/* Imagens */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Imagens
                  </h3>
                  <Button
                    color="primary"
                    size="sm"
                    type="button"
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
                          size="sm"
                          value={image.url}
                          variant="bordered"
                          onValueChange={(value) =>
                            handleImageChange(index, "url", value)
                          }
                        />
                        <Input
                          label="Texto Alternativo"
                          placeholder="Descrição da imagem"
                          size="sm"
                          value={image.alt}
                          variant="bordered"
                          onValueChange={(value) =>
                            handleImageChange(index, "alt", value)
                          }
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            checked={image.primary}
                            className="w-4 h-4"
                            type="checkbox"
                            onChange={(e) =>
                              handleImageChange(
                                index,
                                "primary",
                                e.target.checked,
                              )
                            }
                          />
                          <span className="text-sm text-gray-600">
                            Imagem Principal
                          </span>
                        </label>
                      </div>
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        type="button"
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
          </DrawerBody>
          <DrawerFooter className="border-t border-gray-200 gap-2">
            <Button
              className="flex-1"
              disabled={loading}
              variant="bordered"
              onPress={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 font-semibold"
              color="warning"
              isLoading={loading}
              type="submit"
            >
              {product ? "Atualizar" : "Adicionar"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
