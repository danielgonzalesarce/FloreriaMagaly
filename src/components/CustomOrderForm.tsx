import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export const CustomOrderForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    address: '',
    message: '',
    details: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hola Florería Magaly, deseo realizar un pedido personalizado:
    
    *Nombre:* ${formData.name}
    *Teléfono:* ${formData.phone}
    *Fecha de entrega:* ${formData.date}
    *Dirección:* ${formData.address}
    *Detalles:* ${formData.details}
    *Mensaje para la tarjeta:* ${formData.message}`;

    window.open(`https://wa.me/51936068781?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Pedido Personalizado</h3>
      <input type="text" placeholder="Tu nombre" required className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, name: e.target.value})} />
      <input type="tel" placeholder="Tu teléfono" required className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      <input type="date" required className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, date: e.target.value})} />
      <input type="text" placeholder="Dirección de entrega" required className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, address: e.target.value})} />
      <textarea placeholder="Detalles del arreglo (flores, colores, tamaño)" required className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, details: e.target.value})} />
      <textarea placeholder="Mensaje para la tarjeta (opcional)" className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, message: e.target.value})} />
      <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors">
        <MessageCircle className="w-5 h-5" />
        Enviar pedido por WhatsApp
      </button>
    </form>
  );
};
