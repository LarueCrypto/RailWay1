import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, Coins, Gem, Beaker, TestTube2, Wine, Crown, Shield, ShieldCheck,
  ScrollText, Timer, Dumbbell, Sparkles, Sword, Swords, Moon, ShieldHalf, Circle,
  Diamond, Link, Target, Users, Sunrise, Award, Frame, Zap, Lock, Search,
  ShoppingCart, Minus, Plus, Check, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { UserStats } from "@shared/schema";
import { ALL_SHOP_ITEMS, RARITY_COLORS, type ShopItem, type ShopItemCategory, type ShopItemRarity } from "@shared/shopItems";

const iconMap: Record<string, any> = {
  Flask: Beaker, FlaskConical: TestTube2, Wine, Crown, Coins, Shield, ShieldCheck, ScrollText, Timer,
  Dumbbell, Sparkles, Sword, Swords, Moon, ShieldHalf, Circle, Diamond, Gem,
  Link, Target, Users, Sunrise, Award, Frame, Zap, Beaker, TestTube2
};

const CATEGORY_INFO: Record<ShopItemCategory, { label: string; icon: any; description: string }> = {
  consumable: { label: "Consumables", icon: Beaker, description: "Temporary boosts and one-time use items" },
  equipment: { label: "Equipment", icon: Sword, description: "Permanent gear with stat bonuses" },
  material: { label: "Materials", icon: Diamond, description: "Crafting components and upgrade materials" },
  ability: { label: "Abilities", icon: Zap, description: "Permanent special powers" },
  cosmetic: { label: "Cosmetics", icon: Sparkles, description: "Visual customization items" },
};

function ShopItemCard({ 
  item, 
  userGold,
  userLevel,
  onClick 
}: { 
  item: ShopItem; 
  userGold: number;
  userLevel: number;
  onClick: () => void;
}) {
  const Icon = iconMap[item.icon] || Sparkles;
  const rarityColors = RARITY_COLORS[item.rarity];
  const canAfford = userGold >= item.price.gold;
  const meetsLevel = !item.levelRequired || userLevel >= item.levelRequired;
  const isLocked = !canAfford || !meetsLevel;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <Card 
        className={cn(
          "p-4 cursor-pointer transition-all duration-300 hover-elevate relative overflow-visible",
          isLocked && "opacity-70"
        )}
        onClick={onClick}
        data-testid={`card-shop-item-${item.id}`}
      >
        <div className="absolute -top-2 -right-2">
          <Badge className={cn("text-xs capitalize shadow-lg", rarityColors.bg, rarityColors.text, rarityColors.glow && `shadow-md ${rarityColors.glow}`)}>
            {item.rarity}
          </Badge>
        </div>
        
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
            `bg-gradient-to-br ${rarityColors.bg}/20`,
            rarityColors.border,
            "border"
          )}>
            <Icon className={cn("w-6 h-6", rarityColors.bg.replace("bg-", "text-"))} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm truncate">{item.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <span className={cn(
              "flex items-center gap-1 text-sm font-medium",
              !canAfford && "text-destructive"
            )}>
              <Coins className="w-4 h-4 text-yellow-500" />
              {item.price.gold.toLocaleString()}
            </span>
            {item.price.crystals && item.price.crystals > 0 && (
              <span className="flex items-center gap-1 text-sm font-medium text-purple-500">
                <Gem className="w-3.5 h-3.5" />
                {item.price.crystals}
              </span>
            )}
          </div>
          
          {item.levelRequired && !meetsLevel && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Lock className="w-3 h-3" />
              Lv.{item.levelRequired}
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function ItemDetailModal({ 
  item, 
  userGold,
  userLevel,
  onClose,
  onPurchase
}: { 
  item: ShopItem | null;
  userGold: number;
  userLevel: number;
  onClose: () => void;
  onPurchase: (item: ShopItem, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  
  if (!item) return null;
  
  const Icon = iconMap[item.icon] || Sparkles;
  const rarityColors = RARITY_COLORS[item.rarity];
  const totalGold = item.price.gold * quantity;
  const totalCrystals = (item.price.crystals || 0) * quantity;
  const canAfford = userGold >= totalGold;
  const meetsLevel = !item.levelRequired || userLevel >= item.levelRequired;

  return (
    <Dialog open={!!item} onOpenChange={() => { setQuantity(1); onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center",
              `bg-gradient-to-br ${rarityColors.bg}/20`,
              rarityColors.border,
              "border-2"
            )}>
              <Icon className={cn("w-7 h-7", rarityColors.bg.replace("bg-", "text-"))} />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {item.name}
                <Badge className={cn("capitalize", rarityColors.bg, rarityColors.text)}>
                  {item.rarity}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-left">
                {CATEGORY_INFO[item.category]?.label || item.category}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">{item.description}</p>
          
          {item.effect && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Effect</p>
              <div className="text-sm text-muted-foreground">
                {item.effect.type === "xp_multiplier" && (
                  <p>{item.effect.value}x XP for {Math.floor((item.effect.duration || 0) / 3600)} hours</p>
                )}
                {item.effect.type === "gold_multiplier" && (
                  <p>{item.effect.value}x Gold for {Math.floor((item.effect.duration || 0) / 3600)} hours</p>
                )}
                {item.effect.type === "streak_protection" && (
                  <p>Protects streak {item.effect.uses} time(s)</p>
                )}
                {item.effect.type === "category_xp_boost" && (
                  <p>+{Math.round((item.effect.value! - 1) * 100)}% XP for {item.effect.category} goals</p>
                )}
                {item.effect.type === "stat_boost_temp" && (
                  <p>+{item.effect.value} to all stats for 24 hours</p>
                )}
                {item.effect.type === "stat_boost_perm" && (
                  <p>Permanently +{item.effect.value} to one stat of your choice</p>
                )}
                {item.effect.type === "habit_double_chance" && (
                  <p>{Math.round(item.effect.value! * 100)}% chance for habits to count twice</p>
                )}
                {item.effect.type === "critical_chance" && (
                  <p>{Math.round((item.effect.chance || 0) * 100)}% chance for {item.effect.multiplier}x XP</p>
                )}
              </div>
            </div>
          )}
          
          {item.stats && Object.keys(item.stats).length > 0 && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Stat Bonuses</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(item.stats).map(([stat, value]) => (
                  <Badge key={stat} variant="outline" className="capitalize">
                    +{value} {stat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {item.levelRequired && (
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg",
              meetsLevel ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
            )}>
              {meetsLevel ? (
                <Check className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span className="text-sm">
                {meetsLevel ? "Level requirement met" : `Requires Level ${item.levelRequired}`}
              </span>
            </div>
          )}
          
          {item.stackable && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-quantity-decrease"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(item.maxStack || 99, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center"
                  min={1}
                  max={item.maxStack || 99}
                  data-testid="input-quantity"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(Math.min(item.maxStack || 99, quantity + 1))}
                  disabled={quantity >= (item.maxStack || 99)}
                  data-testid="button-quantity-increase"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className={cn(
              "flex items-center gap-1 font-bold text-lg",
              !canAfford && "text-destructive"
            )}>
              <Coins className="w-5 h-5 text-yellow-500" />
              {totalGold.toLocaleString()}
            </span>
            {totalCrystals > 0 && (
              <span className="flex items-center gap-1 font-bold text-lg text-purple-500">
                <Gem className="w-4 h-4" />
                {totalCrystals}
              </span>
            )}
          </div>
          
          <Button
            onClick={() => onPurchase(item, quantity)}
            disabled={!canAfford || !meetsLevel}
            className="gap-2"
            data-testid="button-purchase"
          >
            <ShoppingCart className="w-4 h-4" />
            {!meetsLevel ? "Level Required" : !canAfford ? "Insufficient Gold" : "Purchase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<ShopItemCategory>("consumable");
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<ShopItemRarity | "all">("all");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const { toast } = useToast();

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const userGold = stats?.currentGold || 0;
  const userLevel = stats?.level || 1;

  const purchaseMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return await apiRequest('/api/shop/purchase', {
        method: 'POST',
        body: JSON.stringify({ itemId, quantity }),
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/inventory'] });
      toast({
        title: "Purchase Successful!",
        description: `You spent ${data.goldSpent.toLocaleString()} gold. Remaining: ${data.remainingGold.toLocaleString()}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Could not complete purchase",
        variant: "destructive",
      });
    },
  });

  const filteredItems = useMemo(() => {
    let items = ALL_SHOP_ITEMS.filter(item => item.category === activeCategory);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    if (rarityFilter !== "all") {
      items = items.filter(item => item.rarity === rarityFilter);
    }
    
    return items;
  }, [activeCategory, searchQuery, rarityFilter]);

  const handlePurchase = (item: ShopItem, quantity: number) => {
    purchaseMutation.mutate({ itemId: item.id, quantity });
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              Hunter's Shop
            </h1>
            <p className="text-muted-foreground mt-1">Enhance your journey with powerful items</p>
          </div>
          
          <Card className="p-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-500" />
              <span className="font-bold text-xl font-display">{userGold.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-lg font-display">0</span>
            </div>
          </Card>
        </div>

        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as ShopItemCategory)}>
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
            {(Object.entries(CATEGORY_INFO) as [ShopItemCategory, typeof CATEGORY_INFO[ShopItemCategory]][]).map(([key, info]) => {
              const Icon = info.icon;
              const count = ALL_SHOP_ITEMS.filter(i => i.category === key).length;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid={`tab-category-${key}`}
                >
                  <Icon className="w-4 h-4" />
                  {info.label}
                  <Badge variant="secondary" className="text-xs ml-1">{count}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-shop-search"
              />
            </div>
            
            <Select value={rarityFilter} onValueChange={(v) => setRarityFilter(v as ShopItemRarity | "all")}>
              <SelectTrigger className="w-36" data-testid="select-rarity-filter">
                <SelectValue placeholder="All Rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="mythic">Mythic</SelectItem>
                <SelectItem value="divine">Divine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground flex items-center gap-2">
            {(() => {
              const Icon = CATEGORY_INFO[activeCategory]?.icon || Store;
              return <Icon className="w-4 h-4" />;
            })()}
            {CATEGORY_INFO[activeCategory]?.description}
          </div>
          
          {(Object.keys(CATEGORY_INFO) as ShopItemCategory[]).map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      userGold={userGold}
                      userLevel={userLevel}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </AnimatePresence>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No items found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <ItemDetailModal
        item={selectedItem}
        userGold={userGold}
        userLevel={userLevel}
        onClose={() => setSelectedItem(null)}
        onPurchase={handlePurchase}
      />
    </div>
  );
}
