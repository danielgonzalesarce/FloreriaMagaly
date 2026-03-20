import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  setDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { db, auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthModal } from './components/AuthModal';
import { CustomOrderForm } from './components/CustomOrderForm';
import { CatalogFilters } from './components/CatalogFilters';
import { Arrangement, UserProfile, OperationType, CartItem } from './types';
import { handleFirestoreError } from './utils';
import { 
  Flower, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  LogIn, 
  Check, 
  X, 
  ChevronRight, 
  ChevronLeft,
  MessageCircle,
  Settings,
  Image as ImageIcon,
  DollarSign,
  Tag,
  AlertCircle,
  MapPin,
  ShoppingCart,
  Minus,
  Search,
  Filter,
  Map,
  Instagram,
  Facebook,
  Truck,
  Heart,
  ShieldCheck,
  MousePointer,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setErrorInfo(event.error?.message || 'Unknown error');
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
          <p className="text-gray-600 mb-6">Lo sentimos, ha ocurrido un error inesperado.</p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-xs font-mono overflow-auto max-h-40 mb-6">
            {errorInfo}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const Navbar: React.FC<{ 
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean; 
  onLogin: () => void; 
  onLogout: () => void;
  showAdmin: boolean;
  setShowAdmin: (show: boolean) => void;
  cartCount: number;
  onCartClick: () => void;
}> = ({ user, userProfile, isAdmin, onLogin, onLogout, showAdmin, setShowAdmin, cartCount, onCartClick }) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setShowAdmin(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-200">
            <Flower className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Florería Magaly
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowAdmin(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-rose-500 transition-colors">Inicio</a>
          <a href="#catalog-grid" onClick={(e) => { e.preventDefault(); setShowAdmin(false); document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-rose-500 transition-colors">Catálogo</a>
          <a href="#ubicacion" onClick={(e) => { e.preventDefault(); setShowAdmin(false); document.getElementById('ubicacion')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-rose-500 transition-colors">Ubicación</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-gray-200">
            <a href="#" className="w-9 h-9 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 hover:scale-110 transition-all" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 hover:scale-110 transition-all" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://wa.me/51936068781?text=Hola%20Florer%C3%ADa%20Magaly%2C%20deseo%20hacer%20un%20pedido%20personalizado.%0A%0A%F0%9F%8C%B8%20*Detalles%20del%20arreglo%3A*%20%5BEscribe%20aqu%C3%AD%20los%20colores%2C%20tipo%20de%20flores%2C%20etc.%5D%0A%F0%9F%93%85%20*Fecha%20de%20entrega%3A*%20%5BEscribe%20la%20fecha%5D%0A%F0%9F%93%8D%20*Lugar%20de%20entrega%3A*%20%5BEscribe%20el%20distrito%20o%20direcci%C3%B3n%5D%0A%F0%9F%92%8C%20*Mensaje%20para%20la%20tarjeta%3A*%20%5BOpcional%5D" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 hover:scale-110 transition-all" aria-label="WhatsApp">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>

          <button 
            onClick={onCartClick}
            className="relative p-2 text-gray-600 hover:text-rose-600 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                {cartCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button 
              onClick={() => setShowAdmin(!showAdmin)}
              className={cn(
                "p-2 rounded-full transition-all",
                showAdmin ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100 text-gray-600"
              )}
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          
          {user ? (
            <div className="flex items-center gap-3">
              <img 
                src={user.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user.uid}&gender=${userProfile?.gender === 'mujer' ? 'female' : 'male'}`} 
                alt={user.displayName || 'Usuario'} 
                className="w-8 h-8 rounded-full ring-2 ring-rose-100 bg-white"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={onLogout}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-rose-600 transition-all shadow-md shadow-rose-100"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const ArrangementCard: React.FC<{ 
  arrangement: Arrangement; 
  onImageClick: (arrangement: Arrangement) => void;
  onAddToCart: (arrangement: Arrangement) => void;
}> = ({ arrangement, onImageClick, onAddToCart }) => {
  const displayImage = arrangement.imageUrls?.[0] || arrangement.imageUrl;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => onImageClick(arrangement)}>
        <img 
          src={displayImage} 
          alt={arrangement.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ImageIcon className="text-white opacity-0 group-hover:opacity-100 w-8 h-8 transition-opacity" />
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-rose-600 shadow-sm uppercase tracking-wider">
            {arrangement.category || 'Especial'}
          </span>
        </div>
        {arrangement.imageUrls && arrangement.imageUrls.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
            1/{arrangement.imageUrls.length}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
          {arrangement.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[2.5rem] flex-grow">
          {arrangement.description || 'Un hermoso detalle para sorprender a esa persona especial.'}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-black text-gray-900">
            S/ {arrangement.price.toFixed(2)}
          </span>
          <button 
            onClick={() => onAddToCart(arrangement)}
            className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100"
          >
            <ShoppingCart className="w-5 h-5" />
            Agregar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [arrangements, setArrangements] = useState<Arrangement[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWaMessage, setShowWaMessage] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        }
      }, (error) => {
        if (error.code === 'permission-denied') {
          console.warn('Permission denied for user profile snapshot. This might be normal during initial login if the profile is being created.');
        } else {
          console.error('Error in user profile snapshot:', error);
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      });
      return () => unsubscribe();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Arrangement>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    imageUrls: [],
    category: 'Rosas',
    active: true
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, replaceIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    console.log("Starting upload for file:", file.name);
    try {
      // Ensure the path is correct and accessible
      const storageRef = ref(storage, `arrangements/${Date.now()}_${file.name}`);
      console.log("Storage ref created:", storageRef.fullPath);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      console.log("Upload complete");
      
      // Get the download URL
      const url = await getDownloadURL(storageRef);
      console.log("Download URL:", url);
      
      const currentUrls = [...(formData.imageUrls || [])];
      
      if (replaceIndex !== undefined && replaceIndex >= 0 && replaceIndex < currentUrls.length) {
        currentUrls[replaceIndex] = url;
      } else {
        currentUrls.push(url);
      }
      
      setFormData({ 
        ...formData, 
        imageUrls: currentUrls,
        imageUrl: currentUrls[0] || url
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      // More specific error handling
      if (error.code === 'storage/unauthorized') {
        alert("No tienes permiso para subir imágenes. Por favor, contacta al administrador.");
      } else {
        alert("Error al subir la imagen. Detalles: " + error.message);
      }
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading same file again
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const currentUrls = [...(formData.imageUrls || [])];
    currentUrls.splice(index, 1);
    setFormData({
      ...formData,
      imageUrls: currentUrls,
      imageUrl: currentUrls[0] || ''
    });
  };

  useEffect(() => {
    // Show the message initially after 3 seconds
    const initialTimeout = setTimeout(() => {
      setShowWaMessage(true);
      setTimeout(() => setShowWaMessage(false), 5000); // Hide after 5s
    }, 3000);

    // Then show it every 10 seconds (10s hidden + 5s visible = 15s cycle)
    const interval = setInterval(() => {
      setShowWaMessage(true);
      setTimeout(() => setShowWaMessage(false), 5000);
    }, 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isDefaultAdmin = currentUser.email === "daniel.gonzales.a@tecsup.edu.pe";
        
        if (isDefaultAdmin) {
          setIsAdmin(true);
          // Auto-create admin profile if it doesn't exist
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email,
              role: 'admin'
            });
          }
        } else {
          setIsAdmin(false);
          setShowAdmin(false); // Ensure non-admins don't see the admin panel
        }
      } else {
        setIsAdmin(false);
        setShowAdmin(false);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    // If admin, show everything. If not, only show active items.
    // This matches the security rules: allow read: if resource.data.active == true || isAdmin();
    const arrangementsRef = collection(db, 'arrangements');
    const q = isAdmin 
      ? query(arrangementsRef, orderBy('createdAt', 'desc'))
      : query(arrangementsRef, where('active', '==', true), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Arrangement[];
      setArrangements(items);
      setLoading(false);
    }, (error) => {
      // If we get a permission error, it might be because isAdmin is still false 
      // but the user is actually an admin (race condition). 
      // We handle it gracefully by logging but not crashing if possible.
      if (error.code === 'permission-denied') {
        console.warn("Permission denied for arrangements list. Query:", isAdmin ? "Admin (all)" : "Filtered (active only)");
      } else {
        console.error('Error in arrangements list snapshot:', error);
        handleFirestoreError(error, OperationType.LIST, 'arrangements');
      }
    });

    return () => unsubscribe();
  }, [isAuthReady, isAdmin]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Login failed", error);
      throw error; // Re-throw so AuthModal can catch it
    }
  };

  const handleLogout = () => signOut(auth);

  const [galleryState, setGalleryState] = useState<{ arrangement: Arrangement; currentIndex: number } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (arrangement: Arrangement) => {
    setCart(prev => {
      const existing = prev.find(item => item.arrangement.id === arrangement.id);
      if (existing) {
        return prev.map(item => item.arrangement.id === arrangement.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { arrangement, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.arrangement.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const checkoutWhatsApp = () => {
    if (cart.length === 0) return;
    const text = cart.map(item => `${item.quantity}x ${item.arrangement.name} (S/ ${(item.arrangement.price * item.quantity).toFixed(2)})`).join('\n');
    const total = cart.reduce((sum, item) => sum + (item.arrangement.price * item.quantity), 0);
    const message = `Hola Florería Magaly, quiero confirmar el siguiente pedido:\n\n${text}\n\nTotal: S/ ${total.toFixed(2)}`;
    window.open(`https://wa.me/51936068781?text=${encodeURIComponent(message)}`, '_blank');
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const seedDatabase = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setSuccessMessage(null);

    const initialData = [
      // --- RAMOS ---
      ...[1,2,3,4,5].map(i => ({ name: `Ramo de ${i*6} Tulipanes`, description: `Hermoso ramo de ${i*6} tulipanes frescos.`, price: 50 + i*20, imageUrl: "https://images.unsplash.com/photo-1525310238806-e156c2f98b0b?q=80&w=500", category: "Ramos", subCategory: "Tulipanes", active: true })),
      ...[1,2,3,4,5].map(i => ({ name: `Ramo de ${i*2} Orquídeas`, description: `Elegante ramo de ${i*2} orquídeas exóticas.`, price: 80 + i*30, imageUrl: "https://images.unsplash.com/photo-1565011523534-747a8601f10a?q=80&w=500", category: "Ramos", subCategory: "Orquídeas", active: true })),
      ...[1,2,3,4,5].map(i => ({ name: `Ramo de ${i*12} Rosas`, description: `Clásico ramo de ${i*12} rosas rojas apasionadas.`, price: 60 + i*25, imageUrl: "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?q=80&w=500", category: "Ramos", subCategory: "Rosas", active: true })),
      ...[1,2,3,4,5].map(i => ({ name: `Ramo de ${i*5} Girasoles`, description: `Radiante ramo de ${i*5} girasoles luminosos.`, price: 40 + i*15, imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=500", category: "Ramos", subCategory: "Girasoles", active: true })),
      ...[1,2,3,4,5].map(i => ({ name: `Ramo de ${i*10} Margaritas`, description: `Tierno ramo de ${i*10} margaritas frescas.`, price: 30 + i*10, imageUrl: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=500", category: "Ramos", subCategory: "Margaritas", active: true })),
      
      // --- CANASTAS ---
      ...[1,2,3,4,5].map(i => ({ name: `Canasta Floral ${i}`, description: `Hermosa canasta con variedad de flores frescas.`, price: 100 + i*40, imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=500", category: "Canastas", active: true })),
    ];

    try {
      console.log('Starting database seed...');
      // Clear existing arrangements first
      const snapshot = await getDocs(collection(db, 'arrangements'));
      console.log(`Found ${snapshot.size} existing arrangements to delete.`);
      const deletePromises = snapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'arrangements', docSnapshot.id))
      );
      await Promise.all(deletePromises);
      console.log('Existing arrangements deleted.');

      // Add new arrangements
      console.log(`Adding ${initialData.length} new arrangements...`);
      for (const item of initialData) {
        await addDoc(collection(db, 'arrangements'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }
      console.log('Database seeded successfully!');
      setLoading(false);
      setSuccessMessage('Base de datos cargada con éxito');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error seeding database:', error);
      setLoading(false);
      handleFirestoreError(error, OperationType.CREATE, 'arrangements');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'arrangements', isEditing), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        setIsEditing(null);
      } else {
        await addDoc(collection(db, 'arrangements'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setFormData({ name: '', description: '', price: 0, imageUrl: '', imageUrls: [], category: 'Rosas', active: true });
    } catch (error) {
      handleFirestoreError(error, isEditing ? OperationType.UPDATE : OperationType.CREATE, 'arrangements');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'arrangements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'arrangements');
    }
  };

  const startEdit = (arr: Arrangement) => {
    setIsEditing(arr.id);
    setFormData({
      name: arr.name,
      description: arr.description,
      price: arr.price,
      imageUrl: arr.imageUrl,
      imageUrls: arr.imageUrls || [arr.imageUrl],
      category: arr.category,
      active: arr.active
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSubCategory = (sub: string) => {
    setActiveSubCategories(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeSubCategories, setActiveSubCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredArrangements = arrangements
    .filter(a => isAdmin || a.active)
    .filter(a => activeCategory === 'Todos' || a.category === activeCategory)
    .filter(a => activeSubCategories.length === 0 || (a.subCategory && activeSubCategories.includes(a.subCategory)))
    .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900">
        <Navbar 
          user={user} 
          userProfile={userProfile}
          isAdmin={isAdmin} 
          onLogin={() => setIsAuthModalOpen(true)} 
          onLogout={handleLogout}
          showAdmin={showAdmin}
          setShowAdmin={setShowAdmin}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
        />
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onGoogleLogin={handleLogin}
          onEmailLogin={(email, pass) => signInWithEmailAndPassword(auth, email, pass)}
          onRegister={async (email, pass, gender) => {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              email: email,
              role: 'user',
              gender: gender
            });
          }}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {showAdmin && isAdmin ? (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      {isEditing ? <Edit className="w-6 h-6 text-rose-500" /> : <Plus className="w-6 h-6 text-rose-500" />}
                      {isEditing ? 'Editar Arreglo' : 'Nuevo Arreglo'}
                    </h2>
                    <div className="flex items-center gap-4">
                      {successMessage && (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1 animate-pulse">
                          <Check className="w-4 h-4" />
                          {successMessage}
                        </span>
                      )}
                      <button 
                        type="button"
                        onClick={seedDatabase}
                        className="text-sm bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold hover:bg-rose-100 transition-colors flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Cargar Datos de Prueba
                      </button>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                        <div className="relative">
                          <Flower className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all"
                            placeholder="Ej: Ramo de 12 Rosas Rojas"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                        <textarea 
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all h-24"
                          placeholder="Detalles del arreglo..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Precio (S/)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                              type="number" 
                              required
                              step="0.01"
                              value={formData.price}
                              onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                          <div className="relative">
                            <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <select 
                              value={formData.category}
                              onChange={e => setFormData({...formData, category: e.target.value})}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all appearance-none"
                            >
                              <option value="Rosas">Rosas</option>
                              <option value="Girasoles">Girasoles</option>
                              <option value="Tulipanes">Tulipanes</option>
                              <option value="Orquídeas">Orquídeas</option>
                              <option value="Mixtos">Mixtos</option>
                              <option value="Cajas">Cajas</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Imágenes del Arreglo</label>
                        <div className="space-y-4">
                          {/* Current Images List */}
                          <div className="grid grid-cols-2 gap-3">
                            {(formData.imageUrls || []).map((url, index) => (
                              <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <label className="p-2 bg-white text-gray-700 rounded-full cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm">
                                    <Edit className="w-4 h-4" />
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={(e) => handleImageUpload(e, index)} 
                                      disabled={isUploading}
                                      className="hidden" 
                                    />
                                  </label>
                                  <button 
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="p-2 bg-white text-gray-700 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                  {index === 0 ? 'Principal' : `Imagen ${index + 1}`}
                                </div>
                              </div>
                            ))}
                            
                            {/* Add New Image Button */}
                            <label className="cursor-pointer aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-rose-300 hover:bg-rose-50 transition-all group">
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                                <Plus className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                              </div>
                              <span className="text-xs font-medium text-gray-400 group-hover:text-rose-600">
                                {isUploading ? 'Subiendo...' : 'Agregar Imagen'}
                              </span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e)} 
                                disabled={isUploading}
                                className="hidden" 
                              />
                            </label>
                          </div>

                          {/* Manual URL Input */}
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea 
                              value={formData.imageUrls?.join('\n') || ''}
                              onChange={e => {
                                const urls = e.target.value.split('\n').map(u => u.trim()).filter(u => u !== '');
                                setFormData({
                                  ...formData, 
                                  imageUrls: urls,
                                  imageUrl: urls[0] || ''
                                });
                              }}
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all h-20 text-xs"
                              placeholder="O pega URLs de imágenes aquí (una por línea)"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <input 
                          type="checkbox" 
                          id="active"
                          checked={formData.active}
                          onChange={e => setFormData({...formData, active: e.target.checked})}
                          className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500 border-gray-300"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700">Producto Activo (Visible en catálogo)</label>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                      <button 
                        type="submit"
                        className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                      >
                        {isEditing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {isEditing ? 'Guardar Cambios' : 'Agregar al Catálogo'}
                      </button>
                      {isEditing && (
                        <button 
                          type="button"
                          onClick={() => {
                            setIsEditing(null);
                            setFormData({ name: '', description: '', price: 0, imageUrl: '', category: 'Rosas', active: true });
                          }}
                          className="px-6 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Producto</th>
                        <th className="px-6 py-4">Categoría</th>
                        <th className="px-6 py-4">Precio</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {arrangements.map(arr => (
                        <tr key={arr.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={arr.imageUrl} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                              <span className="font-semibold text-gray-900">{arr.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{arr.category}</td>
                          <td className="px-6 py-4 font-bold">S/ {arr.price.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                              arr.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                            )}>
                              {arr.active ? 'Activo' : 'Oculto'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => startEdit(arr)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDelete(arr.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="catalog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {/* Hero Section */}
                <section className="relative rounded-[2.5rem] overflow-hidden bg-rose-500 py-24 px-8 text-center text-white">
                  <div className="absolute inset-0 opacity-20">
                    <img 
                      src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=2000" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="relative z-10 max-w-3xl mx-auto">
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl md:text-6xl font-black mb-6 leading-tight"
                    >
                      El lenguaje del amor, escrito en pétalos
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-lg md:text-xl text-rose-100 mb-8 leading-relaxed"
                    >
                      Creamos arreglos únicos para celebrar la vida, el amor y los instantes que merecen ser recordados. 
                      Flores frescas seleccionadas a mano, diseño exclusivo y entrega puntual para que tu detalle llegue directo al corazón.
                      <br />
                      <span className="inline-flex items-center gap-2 mt-4 text-white font-semibold">
                        <MapPin className="w-5 h-5" />
                        Visítanos en nuestra tienda física y vive la experiencia.
                      </span>
                    </motion.p>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-wrap justify-center gap-4"
                    >
                      <button 
                        onClick={() => document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-rose-600 px-8 py-4 rounded-2xl font-bold hover:bg-rose-50 transition-all shadow-xl shadow-rose-900/20 flex items-center gap-2"
                      >
                        Descubre nuestra colección
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  </div>
                </section>

                {/* Benefits Section */}
                <section className="py-16">
                  <h2 className="text-3xl font-black text-center mb-12">¿Por qué elegirnos?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { icon: Truck, title: "Envíos Rápidos", desc: "Entrega garantizada en menos de 24 horas en toda la ciudad." },
                      { icon: Heart, title: "Flores Frescas", desc: "Seleccionamos cada flor diariamente para asegurar la máxima frescura." },
                      { icon: ShieldCheck, title: "Pago Seguro", desc: "Tu información está protegida con cifrado de grado bancario." }
                    ].map((item, i) => (
                      <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group">
                        <div className="bg-rose-100 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
                          <item.icon className="w-8 h-8 text-rose-600" />
                        </div>
                        <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                        <p className="text-gray-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Catalog Grid */}
                <section id="catalog-grid" className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900">Nuestra Colección</h2>
                      <p className="text-gray-500">Elige el detalle perfecto para hoy</p>
                    </div>
                    <CatalogFilters 
                      categories={['Todos', 'Ramos', 'Canastas']}
                      subCategories={['Tulipanes', 'Orquídeas', 'Rosas', 'Girasoles', 'Margaritas']}
                      activeCategory={activeCategory}
                      activeSubCategories={activeSubCategories}
                      setActiveCategory={setActiveCategory}
                      toggleSubCategory={toggleSubCategory}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                    />
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-gray-100 animate-pulse aspect-[4/5] rounded-3xl" />
                      ))}
                    </div>
                  ) : filteredArrangements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredArrangements.map(arr => (
                        <ArrangementCard 
                          key={arr.id} 
                          arrangement={arr} 
                          onImageClick={(arr) => setGalleryState({ arrangement: arr, currentIndex: 0 })} 
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900">No hay arreglos disponibles</h3>
                      <p className="text-gray-500">Intenta con otra categoría o vuelve pronto.</p>
                    </div>
                  )}
                </section>
                <div className="mt-16">
                  <CustomOrderForm />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="bg-white border-t border-gray-100 mt-20">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-200">
                    <Flower className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Florería Magaly</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Somos la mejor opción entre las <strong>florerías en Santa Anita</strong>. Ofrecemos arreglos florales, ramos de rosas, tulipanes y regalos personalizados para toda ocasión. Entregas rápidas y seguras en Santa Anita y todo Lima.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300" aria-label="Instagram">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300" aria-label="Facebook">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="https://wa.me/51936068781?text=Hola%20Florer%C3%ADa%20Magaly%2C%20deseo%20hacer%20un%20pedido%20personalizado.%0A%0A%F0%9F%8C%B8%20*Detalles%20del%20arreglo%3A*%20%5BEscribe%20aqu%C3%AD%20los%20colores%2C%20tipo%20de%20flores%2C%20etc.%5D%0A%F0%9F%93%85%20*Fecha%20de%20entrega%3A*%20%5BEscribe%20la%20fecha%5D%0A%F0%9F%93%8D%20*Lugar%20de%20entrega%3A*%20%5BEscribe%20el%20distrito%20o%20direcci%C3%B3n%5D%0A%F0%9F%92%8C%20*Mensaje%20para%20la%20tarjeta%3A*%20%5BOpcional%5D" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300" aria-label="WhatsApp">
                    <MessageCircle className="w-6 h-6" />
                  </a>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Enlaces Rápidos</h3>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-rose-500 transition-colors">Inicio</a></li>
                  <li><a href="#catalog-grid" onClick={(e) => { e.preventDefault(); document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-rose-500 transition-colors">Catálogo de Flores</a></li>
                  <li><a href="#ubicacion" onClick={(e) => { e.preventDefault(); document.getElementById('ubicacion')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-rose-500 transition-colors">Nuestra Ubicación</a></li>
                  <li><a href="https://wa.me/51936068781?text=Hola%20Florer%C3%ADa%20Magaly%2C%20deseo%20hacer%20un%20pedido%20personalizado.%0A%0A%F0%9F%8C%B8%20*Detalles%20del%20arreglo%3A*%20%5BEscribe%20aqu%C3%AD%20los%20colores%2C%20tipo%20de%20flores%2C%20etc.%5D%0A%F0%9F%93%85%20*Fecha%20de%20entrega%3A*%20%5BEscribe%20la%20fecha%5D%0A%F0%9F%93%8D%20*Lugar%20de%20entrega%3A*%20%5BEscribe%20el%20distrito%20o%20direcci%C3%B3n%5D%0A%F0%9F%92%8C%20*Mensaje%20para%20la%20tarjeta%3A*%20%5BOpcional%5D" className="hover:text-rose-500 transition-colors" target="_blank" rel="noopener noreferrer">Contacto</a></li>
                </ul>
              </div>

              <div id="ubicacion" className="space-y-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  Visítanos en Santa Anita
                </h3>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-gray-600 font-medium">Dirección Principal:</p>
                    <p className="text-sm text-gray-500">Calle Cromotex & Calle María Parado de Bellido</p>
                    <p className="text-sm text-gray-500">Santa Anita, 15008, Provincia de Lima</p>
                    <a 
                      href="https://www.google.com/maps/dir/?api=1&destination=Calle+Cromotex+%26+Calle+María+Parado+de+Bellido+Santa+Anita+15008" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-rose-600 font-bold hover:text-rose-700 mt-2"
                    >
                      <Map className="w-4 h-4" />
                      Cómo llegar
                    </a>
                  </div>
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    <iframe 
                      src="https://maps.google.com/maps?q=Calle%20Cromotex%20%26%20Calle%20Mar%C3%ADa%20Parado%20de%20Bellido%20Santa%20Anita%2C%2015008%2C%20Provincia%20de%20Lima&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-400">
                © 2026 Florería Magaly - La mejor florería en Santa Anita. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>

        {/* Quick View Modal */}
        <AnimatePresence>
          {galleryState && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGalleryState(null)}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-4xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setGalleryState(null)}
                  className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors z-10"
                >
                  <X className="w-8 h-8" />
                </button>
                
                {galleryState.arrangement.imageUrls && galleryState.arrangement.imageUrls.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryState(prev => prev ? {
                        ...prev,
                        currentIndex: prev.currentIndex === 0 ? (prev.arrangement.imageUrls!.length - 1) : prev.currentIndex - 1
                      } : null);
                    }}
                    className="absolute left-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-colors z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                <motion.img 
                  key={galleryState.currentIndex}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  src={galleryState.arrangement.imageUrls ? galleryState.arrangement.imageUrls[galleryState.currentIndex] : galleryState.arrangement.imageUrl} 
                  className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
                  referrerPolicy="no-referrer"
                />

                {galleryState.arrangement.imageUrls && galleryState.arrangement.imageUrls.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryState(prev => prev ? {
                        ...prev,
                        currentIndex: prev.currentIndex === (prev.arrangement.imageUrls!.length - 1) ? 0 : prev.currentIndex + 1
                      } : null);
                    }}
                    className="absolute right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-colors z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
                
                {galleryState.arrangement.imageUrls && galleryState.arrangement.imageUrls.length > 1 && (
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {galleryState.arrangement.imageUrls.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          idx === galleryState.currentIndex ? "bg-white w-4" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[120] flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-rose-500" />
                    <h2 className="text-xl font-bold text-gray-900">Tu Carrito</h2>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p>Tu carrito está vacío.</p>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="mt-6 text-rose-500 font-semibold hover:text-rose-600"
                      >
                        Continuar comprando
                      </button>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.arrangement.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-2xl">
                        <img 
                          src={item.arrangement.imageUrls?.[0] || item.arrangement.imageUrl} 
                          alt={item.arrangement.name}
                          className="w-20 h-20 object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.arrangement.name}</h4>
                          <p className="text-rose-600 font-black text-sm">S/ {item.arrangement.price.toFixed(2)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button 
                              onClick={() => updateCartQuantity(item.arrangement.id, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-rose-600"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.arrangement.id, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-rose-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-500 font-medium">Total a pagar</span>
                      <span className="text-2xl font-black text-gray-900">
                        S/ {cart.reduce((sum, item) => sum + (item.arrangement.price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <button 
                      onClick={checkoutWhatsApp}
                      className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-6 h-6" />
                      Confirmar pedido por WhatsApp
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating WhatsApp Button */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 pointer-events-none">
          <AnimatePresence>
            {showWaMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                className="bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-xl border border-gray-100 relative pointer-events-auto"
              >
                <p className="text-sm font-medium whitespace-nowrap">¡Haz tu pedido personalizado! ✨</p>
                {/* Triangle pointer */}
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 border-[6px] border-transparent border-l-white"></div>
              </motion.div>
            )}
          </AnimatePresence>

          <a 
            href="https://wa.me/51936068781?text=Hola%20Florer%C3%ADa%20Magaly%2C%20deseo%20hacer%20un%20pedido%20personalizado.%0A%0A%F0%9F%8C%B8%20*Detalles%20del%20arreglo%3A*%20%5BEscribe%20aqu%C3%AD%20los%20colores%2C%20tipo%20de%20flores%2C%20etc.%5D%0A%F0%9F%93%85%20*Fecha%20de%20entrega%3A*%20%5BEscribe%20la%20fecha%5D%0A%F0%9F%93%8D%20*Lugar%20de%20entrega%3A*%20%5BEscribe%20el%20distrito%20o%20direcci%C3%B3n%5D%0A%F0%9F%92%8C%20*Mensaje%20para%20la%20tarjeta%3A*%20%5BOpcional%5D" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-green-500 text-white p-4 rounded-full shadow-2xl shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition-all flex items-center justify-center pointer-events-auto"
          >
            <MessageCircle className="w-8 h-8" />
          </a>
        </div>
      </div>
    </ErrorBoundary>
  );
}
