import React, { useState, useEffect } from 'react';

// GLOBAL BOUTIQUE PRODUCT REGISTRY
const PRODUCT_DATABASE = [
  { id: '1001', name: 'Tempered Glass (Universal)', price: 250, discount: 50, highValue: false },
  { id: '1002', name: 'Type-C Fast Charging Cable', price: 450, discount: 100, highValue: false },
  { id: '1003', name: 'Apple 20W Power Adapter', price: 1900, discount: 200, highValue: true }, 
  { id: '1004', name: 'Premium Liquid Silicone Case', price: 600, discount: 150, highValue: false },
  { id: '1005', name: 'Wireless Neckband Earphones', price: 1500, discount: 300, highValue: true },
];

// SIMULATED CLOUD API NETWORK LAYER (Faking Axios/Fetch Calls to a Backend Server)
const MockCloudAPI = {
  sendTransaction: (transactionPayload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulates server processing delay (1.2 seconds network latency)
        resolve({ success: true, status: 201, message: "Committed to cloud DB" });
      }, 1200);
    });
  }
};

function App() {
  // --- CORE SYSTEM STATES ---
  const [currentScreen, setCurrentScreen] = useState('KIOSK'); // Screens: 'KIOSK' or 'GUARD_MONITOR'
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [scannerLaserInput, setScannerLaserInput] = useState(''); 
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(''); 
  const [scanAlert, setScanAlert] = useState(''); 
  
  // Asynchronous network states
  const [isSyncingWithCloud, setIsSyncingWithCloud] = useState(false);
  const [activeNetworkGateTicket, setActiveNetworkGateTicket] = useState(null);

  // --- PERSISTENT ANALYTICS STORAGE ENGINE ---
  const [salesHistory, setSalesHistory] = useState(() => {
    const savedLogs = localStorage.getItem('luxe_network_sales_db');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  useEffect(() => {
    localStorage.setItem('luxe_network_sales_db', JSON.stringify(salesHistory));
  }, [salesHistory]);

  // INPUT FILTERS
  const handleNameChange = (e) => {
    const cleanValue = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    if (cleanValue.length <= 25) setCustomerName(cleanValue);
  };

  const handleMobileChange = (e) => {
    const cleanValue = e.target.value.replace(/\D/g, '');
    if (cleanValue.length <= 10) setMobileNumber(cleanValue);
  };

  // COUNTER LASER RADAR EMULATOR
  const handleHardwareScan = (e) => {
    const inputCode = e.target.value;
    setScannerLaserInput(inputCode);

    const matchedProduct = PRODUCT_DATABASE.find((prod) => prod.id === inputCode.trim());
    
    if (matchedProduct) {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === matchedProduct.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === matchedProduct.id ? { ...item, qty: item.qty + 1 } : item
          );
        }
        return [...prevCart, { ...matchedProduct, qty: 1 }];
      });
      setScannerLaserInput(''); 
      setScanAlert(`✨ Laser Scanned: ${matchedProduct.name}`);
      setTimeout(() => setScanAlert(''), 2500); 
    }
  };

  const updateQty = (id, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, qty: item.qty + amount } : item)).filter((item) => item.qty > 0)
    );
  };

  // CLIENT TO SERVER DISPATCH PIPELINE
  const handleCustomerCheckoutSubmit = () => {
    // Package transaction payload payload data
    const checkoutPayload = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer: customerName,
      phone: mobileNumber,
      amount: totalToPay,
      itemsCount: totalItemsCount,
      method: paymentMethod,
      containsHighValue: cart.some(item => item.highValue),
      status: 'PENDING_GUARD_CLEARANCE'
    };

    // Broadcast over our simulated network to the Guard Terminal
    setActiveNetworkGateTicket(checkoutPayload);
    
    // Clear user station so next user can walk up to physical kiosk counter instantly
    setCart([]);
    setCustomerName('');
    setMobileNumber('');
    setPaymentMethod('');
  };

  // GUARD SECURITY RECONCILIATION & CLOUD SYNC BACKBONE
  const handleGuardGateRelease = async () => {
    setIsSyncingWithCloud(true); // Fire up loading spinner spinners

    // 1. Dispatch across async network pipeline to remote databases
    await MockCloudAPI.sendTransaction(activeNetworkGateTicket);

    // 2. Commit inside internal database ledger tracking matrixes
    const finalizedRecord = { ...activeNetworkGateTicket, status: 'CLEARED_EXIT' };
    setSalesHistory((prevLogs) => [finalizedRecord, ...prevLogs]);

    // 3. Clear wire channels and complete secure connection
    setActiveNetworkGateTicket(null);
    setIsSyncingWithCloud(false);
  };

  // MATH CALCULATORS
  const totalOriginalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount * item.qty, 0);
  const totalToPay = totalOriginalPrice - totalDiscount;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const isNameInvalid = cart.length > 0 && !customerName.trim();
  const isMobileInvalid = cart.length > 0 && mobileNumber.length !== 10;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#E4E4E7] flex flex-col items-center p-4 antialiased selection:bg-[#C5A850]/30 pb-24">
      
      {/* GLOBAL DISTRIBUTED NETWORK CONTROL STRIP */}
      <div className="w-full max-w-md bg-[#1C1C1E] border border-zinc-800 rounded-full p-1.5 flex justify-between mb-6 shadow-inner">
        <button onClick={() => setCurrentScreen('KIOSK')} className={`flex-1 py-2 rounded-full text-xs font-bold tracking-wider transition-all uppercase ${currentScreen === 'KIOSK' ? 'bg-[#C5A850] text-[#161618] shadow' : 'text-zinc-400 hover:text-white'}`}>
          🏪 Kiosk Terminal
        </button>
        <button onClick={() => setCurrentScreen('GUARD_MONITOR')} className={`flex-1 py-2 rounded-full text-xs font-bold tracking-wider transition-all uppercase flex items-center justify-center gap-1.5 ${currentScreen === 'GUARD_MONITOR' ? 'bg-[#C5A850] text-[#161618] shadow' : 'text-zinc-400 hover:text-white'}`}>
          🛡 Guard Screen {activeNetworkGateTicket && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
        </button>
      </div>

      {/* VIEW 1: CUSTOMER SELF-CHECKOUT STATION */}
      {currentScreen === 'KIOSK' && (
        <div className="w-full max-w-md bg-[#161618] rounded-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] border border-[#2A2A2E] overflow-hidden flex flex-col transition-all duration-300" style={{ minHeight: '78vh' }}>
          <header className="p-5 bg-[#1C1C1E] border-b border-[#2A2A2E] text-center tracking-wide">
            <h1 className="text-lg font-medium text-[#D4AF37] uppercase tracking-[0.15em] font-serif">The Luxe Counter</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Self-Checkout Point-of-Sale</p>
          </header>

          <section className="p-4 bg-[#1A1A1C]/40 border-b border-[#2A2A2E] grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-medium text-zinc-400 tracking-widest uppercase mb-1">Guest Name</label>
              <input type="text" value={customerName} onChange={handleNameChange} placeholder="Enter name" className={`w-full bg-[#0E0E0F] border rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors ${isNameInvalid ? 'border-rose-500' : 'border-[#2A2A2E] focus:border-[#D4AF37]'}`} />
              {isNameInvalid && <p className="text-[9px] text-rose-400 mt-1 font-medium">⚠️ Name required</p>}
            </div>
            <div>
              <label className="block text-[9px] font-medium text-zinc-400 tracking-widest uppercase mb-1">Contact Number</label>
              <div className={`flex items-center bg-[#0E0E0F] border rounded-lg overflow-hidden transition-colors ${isMobileInvalid ? 'border-rose-500' : 'border-[#2A2A2E] focus-within:border-[#D4AF37]'}`}>
                <span className="bg-[#1C1C1E] px-2.5 py-2 text-xs text-zinc-500 border-r border-[#2A2A2E] font-medium">+91</span>
                <input type="tel" value={mobileNumber} onChange={handleMobileChange} placeholder="9876543210" className="w-full bg-transparent px-2.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none" />
              </div>
              {isMobileInvalid && <p className="text-[9px] text-rose-400 mt-1 font-medium">⚠️ Enter 10 digits</p>}
            </div>
          </section>

          <section className="p-4 bg-[#1C1C1E]/50 border-b border-[#2A2A2E] space-y-2">
            <label className="block text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest">Hold Item Under Counter Laser Scanner</label>
            <input type="text" value={scannerLaserInput} onChange={handleHardwareScan} placeholder="[ Laser Standby: Type product barcode id to scan ]" className="w-full bg-[#0E0E0F] border-2 border-dashed border-zinc-700 rounded-xl px-4 py-3.5 text-xs text-center tracking-widest text-emerald-400 focus:outline-none focus:border-[#D4AF37] placeholder-zinc-600 font-mono transition-colors" />
            {scanAlert && <p className="text-center text-[10px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 py-1.5 rounded-lg">{scanAlert}</p>}
          </section>

          <main className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-[#0E0E0F]/40">
            <label className="block text-[9px] font-bold text-zinc-500 tracking-widest uppercase mb-1">Registered Items</label>
            {cart.length === 0 ? <p className="text-center py-14 text-xs text-zinc-600 font-serif italic">Scan an item to begin transaction.</p> : (
              cart.map((item) => (
                <div key={item.id} className={`flex items-center justify-between p-3 bg-[#1C1C1E] border rounded-xl ${item.highValue ? 'border-amber-500/20 bg-amber-950/5' : 'border-[#262629]'}`}>
                  <div>
                    <h3 className="font-medium text-xs text-zinc-200">{item.name} {item.highValue && '👑'}</h3>
                    <p className="text-[10px] text-zinc-500">₹{item.price - item.discount}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-[#0E0E0F] border border-[#2A2A2E] rounded-md text-xs">
                      <button onClick={() => updateQty(item.id, -1)} className="px-2.5 py-1 text-zinc-400">-</button>
                      <span className="px-1 font-mono text-zinc-300">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="px-2.5 py-1 text-zinc-400">+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </main>

          <footer className="p-5 bg-[#1C1C1E] border-t border-[#2A2A2E] space-y-4">
            <div className="flex justify-between text-sm font-medium text-white pt-2">
              <span>Total Due Bill Amount</span>
              <span className="text-base text-[#D4AF37] font-mono font-bold">₹{totalToPay}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setPaymentMethod('UPI')} className={`p-2 border rounded-xl text-center text-[10px] font-bold uppercase ${paymentMethod === 'UPI' ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-zinc-800 text-zinc-400'}`}>📱 UPI</button>
              <button onClick={() => setPaymentMethod('CARD')} className={`p-2 border rounded-xl text-center text-[10px] font-bold uppercase ${paymentMethod === 'CARD' ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-zinc-800 text-zinc-400'}`}>💳 Card</button>
              <button onClick={() => setPaymentMethod('CASH')} className={`p-2 border rounded-xl text-center text-[10px] font-bold uppercase ${paymentMethod === 'CASH' ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-zinc-800 text-zinc-400'}`}>💵 Cash</button>
            </div>

            <button onClick={handleCustomerCheckoutSubmit} disabled={!paymentMethod || cart.length === 0 || !customerName.trim() || mobileNumber.length !== 10} className="w-full py-3.5 bg-[#C5A850] text-[#161618] disabled:bg-[#262629] disabled:text-zinc-600 font-bold rounded-xl uppercase tracking-widest text-xs transition-all">
              Transmit Data to Gate Pass
            </button>
          </footer>
        </div>
      )}

      {/* VIEW 2: DISTRIBUTED SECURITY GATE MONITOR VIEW */}
      {currentScreen === 'GUARD_MONITOR' && (
        <div className="w-full max-w-md bg-[#161618] border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-2xl">
          <header className="border-b border-zinc-800 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-serif">Security Audit Feed</h2>
              <p className="text-[9px] text-zinc-500 font-mono">Gate Terminal 04 Network Node</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          </header>

          {/* ACTIVE WIRELESS ALERTS INCOMING FROM KIOSK */}
          <div className="space-y-3">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Live Network Queue</h3>
            
            {!activeNetworkGateTicket ? (
              <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-[#0E0E0F]/50">
                <p className="text-xs text-zinc-600 italic font-serif">No incoming validation tickets detected.</p>
                <p className="text-[9px] text-zinc-500 max-w-[200px] mx-auto mt-1">When a customer taps 'Transmit Data' at the kiosk, their payload instantly routes to this terminal feed wirelessly.</p>
              </div>
            ) : (
              <div className={`border p-4 bg-[#0E0E0F] rounded-xl space-y-4 shadow-lg ${activeNetworkGateTicket.containsHighValue ? 'border-amber-500/30 bg-amber-950/5' : 'border-zinc-800'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-mono text-zinc-500">{activeNetworkGateTicket.id}</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{activeNetworkGateTicket.customer}</h4>
                    <p className="text-[9px] text-zinc-500 font-mono">{activeNetworkGateTicket.phone}</p>
                  </div>
                  <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${activeNetworkGateTicket.method === 'CASH' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {activeNetworkGateTicket.method} PAY
                  </span>
                </div>

                <div className="bg-[#161618] border border-zinc-800 rounded-lg p-3 text-xs flex justify-between items-center font-mono">
                  <div>
                    <p className="text-[8px] text-zinc-500 uppercase tracking-wider">Payload Count</p>
                    <p className="text-zinc-200 font-bold text-sm mt-0.5">{activeNetworkGateTicket.itemsCount} Units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-zinc-500 uppercase tracking-wider">Settlement Bill</p>
                    <p className="text-[#D4AF37] font-bold text-sm mt-0.5">₹{activeNetworkGateTicket.amount}</p>
                  </div>
                </div>

                {activeNetworkGateTicket.containsHighValue && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] p-2 rounded-lg flex items-center gap-2">
                    <span>⚠</span>
                    <p className="font-medium tracking-tight"><strong>High-Value Item Contained:</strong> Physically cross-check security seals before granting pass.</p>
                  </div>
                )}

                <div className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60">
                  {activeNetworkGateTicket.method === 'CASH' ? (
                    <p className="text-amber-400/90 font-medium">👉 <strong>Cash Mandate:</strong> Collect physical cash amounting to <span className="underline font-bold text-white font-mono">₹{activeNetworkGateTicket.amount}</span>. Once verified, clear the turnstile gate.</p>
                  ) : (
                    <p className="text-zinc-500">✅ <strong>Digital Clearance:</strong> Digital payment verified. Ensure physical item count matches baggage payload and execute release.</p>
                  )}
                </div>

                <button 
                  onClick={handleGuardGateRelease} 
                  disabled={isSyncingWithCloud}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {isSyncingWithCloud ? (
                    <>
                      <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      Syncing with Cloud DB...
                    </>
                  ) : (
                    '⚡ Unlock Gate & Dispatch Logs'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* HISTORICAL MASTER SERVER ARCHIVE VIEW */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Cloud Archive Ledger ({salesHistory.length} Records)</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {salesHistory.map((log, i) => (
                <div key={i} className="bg-[#0E0E0F] border border-zinc-900 p-2 rounded-lg flex justify-between items-center text-[10px] font-mono">
                  <div>
                    <span className="text-zinc-300 font-sans font-medium">{log.customer}</span>
                    <span className="text-zinc-600 block text-[9px]">{log.timestamp} · {log.itemsCount} units</span>
                  </div>
                  <span className="text-emerald-400 font-bold">₹{log.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;