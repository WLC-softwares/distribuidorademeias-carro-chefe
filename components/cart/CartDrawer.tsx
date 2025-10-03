"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/drawer";
import { Image } from "@heroui/image";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCart } from "@/hooks";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    getTotal,
    getTotalItems,
    clearCart,
  } = useCart();

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  const handleClearCart = () => {
    if (confirm("Deseja realmente limpar o carrinho?")) {
      clearCart();
    }
  };

  const totalItems = getTotalItems();
  const total = getTotal();

  return (
    <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
      <DrawerContent>
        <DrawerHeader className="flex items-center gap-2 border-b border-gray-200">
          <ShoppingCart size={20} />
          <h2 className="text-xl font-semibold">Carrinho</h2>
          {totalItems > 0 && (
            <Chip color="primary" size="sm" variant="flat">
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </Chip>
          )}
        </DrawerHeader>

        <DrawerBody className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <ShoppingCart className="text-gray-300 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Carrinho vazio
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Adicione produtos ao carrinho para continuar
              </p>
              <Button color="primary" onPress={onClose}>
                Continuar comprando
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((item) => {
                const mainImage =
                  item.product.images?.find((img) => img.primary)?.url ||
                  "/placeholder-product.png";
                const price =
                  item.saleType === "atacado"
                    ? item.product.wholesalePrice
                    : item.product.retailPrice;
                const totalPrice = price * item.quantity;

                return (
                  <div
                    key={`${item.product.id}-${item.saleType}`}
                    className="p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <Image
                          removeWrapper
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                          src={mainImage}
                        />
                      </div>

                      {/* Information */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {item.product.name}
                        </h4>
                        <Chip
                          className={`mb-2 ${item.saleType === "atacado"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                            }`}
                          size="sm"
                          variant="flat"
                        >
                          {item.saleType === "atacado" ? "Atacado" : "Varejo"}
                        </Chip>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              isIconOnly
                              aria-label="Decrease quantity"
                              isDisabled={item.quantity <= 1}
                              size="sm"
                              variant="flat"
                              onPress={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.saleType,
                                  item.quantity - 1,
                                )
                              }
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="text-sm font-medium min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              isIconOnly
                              aria-label="Increase quantity"
                              isDisabled={
                                item.quantity >= item.product.quantity
                              }
                              size="sm"
                              variant="flat"
                              onPress={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.saleType,
                                  item.quantity + 1,
                                )
                              }
                            >
                              <Plus size={14} />
                            </Button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              R$ {totalPrice.toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-500">
                                R$ {price.toFixed(2)} cada
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        isIconOnly
                        aria-label="Remove"
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() =>
                          removeItem(item.product.id, item.saleType)
                        }
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DrawerBody>

        {items.length > 0 && (
          <DrawerFooter className="flex-col gap-3 border-t border-gray-200 p-4">
            {/* Clear Cart Button */}
            <Button
              className="w-full"
              color="danger"
              size="sm"
              variant="light"
              onPress={handleClearCart}
            >
              Limpar carrinho
            </Button>

            <Divider />

            {/* Total */}
            <div className="flex justify-between items-center w-full">
              <span className="text-lg font-semibold text-gray-900">
                Total:
              </span>
              <span className="text-2xl font-bold text-gray-900">
                R$ {total.toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            <Button
              className="w-full font-semibold"
              color="primary"
              size="lg"
              onPress={handleCheckout}
            >
              Finalizar compra
            </Button>

            {/* Continue Shopping Button */}
            <Button
              className="w-full"
              size="lg"
              variant="bordered"
              onPress={onClose}
            >
              Continuar comprando
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
