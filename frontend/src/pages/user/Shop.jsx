import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Filter, ShoppingCart, Package, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useDebounce } from '@/hooks/useDebounce';

const API_BASE_URL = "http://localhost:5000/api";

const CATEGORIES = ["Food", "Toys", "Accessories", "Medicine", "Grooming"];

const fetchProducts = async ({ queryKey }) => {
    const [_, { search, category, minPrice, maxPrice, sortBy, sortOrder }] = queryKey;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('order', sortOrder);

    const response = await axios.get(`${API_BASE_URL}/store/products?${params.toString()}`);
    return response.data.data;
};

export default function UserShop() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [sort, setSort] = useState("newest"); // newest, price-asc, price-desc
    const { addToCart, cartCount } = useCart();

    const debouncedSearch = useDebounce(search, 500);
    const debouncedPriceRange = useDebounce(priceRange, 500);

    // Derived sort params
    const getSortParams = () => {
        switch (sort) {
            case "price-asc": return { sortBy: "price", sortOrder: "asc" };
            case "price-desc": return { sortBy: "price", sortOrder: "desc" };
            default: return { sortBy: "createdAt", sortOrder: "desc" };
        }
    };

    const { data: products, isLoading, isFetching } = useQuery({
        queryKey: ['shop-products', {
            search: debouncedSearch,
            category: selectedCategory,
            minPrice: debouncedPriceRange.min,
            maxPrice: debouncedPriceRange.max,
            ...getSortParams()
        }],
        queryFn: fetchProducts,
        placeholderData: keepPreviousData
    });

    const clearFilters = () => {
        setSelectedCategory("");
        setPriceRange({ min: "", max: "" });
        setSort("newest");
        setSearch("");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Pet Shop</h1>
                    <p className="text-neutral-500">Essentials and goodies for your furry friends.</p>
                </div>
                <Link to="/user/cart">
                    <Button variant="outline" className="gap-2 rounded-full px-6">
                        <ShoppingCart className="w-4 h-4" />
                        Cart ({cartCount})
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9 h-10 bg-white rounded-full border-neutral-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="h-10 gap-2 rounded-full px-6 border-neutral-200">
                            <Filter className="w-4 h-4" /> Filters
                            {(selectedCategory || priceRange.min || priceRange.max || sort !== 'newest') && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full text-xs">!</Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Filter Products</SheetTitle>
                            <SheetDescription>
                                Narrow down your search to find exactly what you need.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="grid gap-6 py-6 px-4">
                            {/* Sort By */}
                            <div className="space-y-2">
                                <Label>Sort By</Label>
                                <Select value={sort} onValueChange={setSort}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest Arrivals</SelectItem>
                                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Categories */}
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <div className="grid gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="all-cat"
                                            checked={!selectedCategory}
                                            onCheckedChange={(checked) => checked && setSelectedCategory("")}
                                        />
                                        <Label htmlFor="all-cat" className="font-normal cursor-pointer">All Categories</Label>
                                    </div>
                                    {CATEGORIES.map((cat) => (
                                        <div key={cat} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`cat-${cat}`}
                                                checked={selectedCategory === cat}
                                                onCheckedChange={(checked) => setSelectedCategory(checked ? cat : "")}
                                            />
                                            <Label htmlFor={`cat-${cat}`} className="font-normal cursor-pointer">{cat}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-2">
                                <Label>Price Range</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    />
                                    <span className="text-neutral-500">-</span>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <SheetFooter className="flex-col gap-2 sm:flex-col">
                            <Button onClick={clearFilters} variant="outline" className="w-full">
                                Clear Filters
                            </Button>
                            <SheetClose asChild>
                                <Button type="submit" className="w-full">Show Results</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Active Filters Summary */}
            {(selectedCategory || priceRange.min || priceRange.max) && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategory && (
                        <Badge variant="secondary" className="px-3 py-1 rounded-full gap-2 text-sm bg-neutral-100 hover:bg-neutral-200">
                            {selectedCategory}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
                        </Badge>
                    )}
                    {priceRange.min && (
                        <Badge variant="secondary" className="px-3 py-1 rounded-full gap-2 text-sm bg-neutral-100 hover:bg-neutral-200">
                            Min: Rs.{priceRange.min}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange({ ...priceRange, min: "" })} />
                        </Badge>
                    )}
                    {priceRange.max && (
                        <Badge variant="secondary" className="px-3 py-1 rounded-full gap-2 text-sm bg-neutral-100 hover:bg-neutral-200">
                            Max: Rs.{priceRange.max}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange({ ...priceRange, max: "" })} />
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-neutral-500 h-7 text-xs hover:bg-transparent hover:text-neutral-900">
                        Clear All
                    </Button>
                </div>
            )}

            {/* Product Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 8].map(i => (
                        <div key={i} className="h-[280px] bg-neutral-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products?.length > 0 ? products.map((product) => (
                        <Link to={`/product/${product.id}`} key={product.id} className="group relative bg-white rounded-3xl p-3 border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 no-underline">
                            {/* Image Container - Square & Cute */}
                            <div className="aspect-square bg-neutral-50 rounded-2xl overflow-hidden relative mb-3">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={`http://localhost:5000${product.images[0]}`}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500 ease-in-out mix-blend-multiply"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                        <Package className="w-10 h-10 opacity-50" />
                                    </div>
                                )}

                                {/* Floating Badge */}
                                {product.stock <= 0 && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="destructive" className="rounded-full px-2 text-[10px] uppercase font-bold shadow-sm">Sold Out</Badge>
                                    </div>
                                )}
                            </div>

                            {/* Details - Compact & Clean */}
                            <div className="px-1 space-y-2">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-neutral-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-primary-600 text-sm bg-primary-50 px-2.5 py-1 rounded-full">
                                            Rs. {product.price}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] uppercase tracking-wide font-bold text-neutral-400">{product.category}</span>
                                    <button
                                        className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-primary-600 transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation(); // Stop link navigation
                                            if (product.stock > 0) {
                                                addToCart(product);
                                                // We can add a toast notification here later
                                            }
                                        }}
                                        disabled={product.stock <= 0}
                                        title={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full py-20 text-center">
                            <h3 className="text-lg font-medium text-neutral-900">No products found</h3>
                            <p className="text-neutral-500 text-sm mt-1">Try different keywords or filters.</p>
                            <Button variant="link" onClick={clearFilters} className="mt-2">Clear all filters</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
