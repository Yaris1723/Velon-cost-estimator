/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  FileCheck, 
  Calculator, 
  IndianRupee, 
  Download,
  Share2,
  Printer,
  HardHat,
  MapPin,
  Calendar as CalendarIcon,
  Plus
} from "lucide-react";
import { useEstimateStore, ProjectDetails, MaterialItem } from "@/store/useEstimateStore";
import { INITIAL_RATES, MATERIAL_CATEGORIES, MATERIAL_UNITS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const MATERIAL_KEY_TO_CATEGORY: Record<string, string> = {
  cement: MATERIAL_CATEGORIES.CEMENT,
  steel: MATERIAL_CATEGORIES.STEEL,
  sand: MATERIAL_CATEGORIES.SAND,
  mSand: MATERIAL_CATEGORIES.MSAND,
  jalli40: MATERIAL_CATEGORIES.JALLI_40,
  jalli20: MATERIAL_CATEGORIES.JALLI_20,
  jalli12: MATERIAL_CATEGORIES.JALLI_12,
  bricks: MATERIAL_CATEGORIES.MASONRY,
  tiles: MATERIAL_CATEGORIES.FINISHING,
  paint: MATERIAL_CATEGORIES.FINISHING,
  putty: MATERIAL_CATEGORIES.FINISHING,
  electrical: MATERIAL_CATEGORIES.ELECTRICAL,
  plumbing: MATERIAL_CATEGORIES.PLUMBING,
  doors: "Woodwork",
  windows: "Fabrication",
};

function NewEstimateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const tabParam = searchParams.get("tab");
  const { estimates, addEstimate, updateEstimate, calculateQuantities, rateLibrary, customMaterials } = useEstimateStore();
  const [activeTab, setActiveTab] = useState("details");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Custom material dialog states
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [selectedLibraryKey, setSelectedLibraryKey] = useState("custom_new");
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialCategory, setNewMaterialCategory] = useState("Custom");
  const [newMaterialUnit, setNewMaterialUnit] = useState("Nos");
  const [newMaterialQuantity, setNewMaterialQuantity] = useState(1);
  const [newMaterialRate, setNewMaterialRate] = useState(0);

  // Combine standard and custom library materials
  const libraryOptions = useMemo(() => [
    ...Object.keys(INITIAL_RATES).map(key => ({
      key,
      name: key.replace(/([A-Z0-9])/g, ' $1'),
      category: MATERIAL_KEY_TO_CATEGORY[key] || 'General',
      unit: MATERIAL_UNITS[key] || 'Unit',
      rate: rateLibrary[key] ?? INITIAL_RATES[key]
    })),
    ...customMaterials.map(m => ({
      key: m.key,
      name: m.name,
      category: m.category,
      unit: m.unit,
      rate: rateLibrary[m.key] ?? 0
    }))
  ], [rateLibrary, customMaterials]);

  useEffect(() => {
    if (selectedLibraryKey === "custom_new") {
      setNewMaterialName("");
      setNewMaterialCategory("Custom");
      setNewMaterialUnit("Nos");
      setNewMaterialRate(0);
    } else {
      const selected = libraryOptions.find(o => o.key === selectedLibraryKey);
      if (selected) {
        setNewMaterialName(selected.name);
        setNewMaterialCategory(selected.category);
        setNewMaterialUnit(selected.unit);
        setNewMaterialRate(selected.rate);
      }
    }
  }, [selectedLibraryKey, libraryOptions]);

  // Step 1: Project Details
  const [details, setDetails] = useState<ProjectDetails>({
    projectName: "",
    clientName: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    projectType: "residential",
    builtUpArea: 0,
    floors: 1,
    foundationType: "Isolated Footing",
    wallThickness: "9 inch",
    slabThickness: "5 inch",
    rooms: 2,
    bathrooms: 2,
    staircase: true,
    parking: true,
  });

  // Step 2 & 3: Materials & Rates
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  
  // Summary State
  const [summary, setSummary] = useState({
    materialTotal: 0,
    labourCost: 0,
    contractorMargin: 10,
    wastage: 5,
    transportation: 0,
    miscellaneous: 0,
    grandTotal: 0,
  });

  // Load existing estimate data if editing
  useEffect(() => {
    if (editId && estimates.length > 0 && !isDataLoaded) {
      const existing = estimates.find(e => e.id === editId);
      if (existing) {
        setDetails(existing.details);
        setMaterials(existing.materials);
        setSummary(existing.summary);
        setIsDataLoaded(true);
      }
    }
  }, [editId, estimates, isDataLoaded]);

  // Set active tab if tab param is present
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Auto-calculate quantities when details change (skip if loading initial edit data)
  useEffect(() => {
    if (editId && !isDataLoaded) {
      return;
    }
    if (details.builtUpArea > 0) {
      const initialMaterials = calculateQuantities(details);
      setMaterials(initialMaterials);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details.builtUpArea, details.projectType, editId, isDataLoaded]);

  // Calculate totals whenever materials or summary factors change
  useEffect(() => {
    const matTotal = materials.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const wastageAmt = (matTotal * summary.wastage) / 100;
    const subtotal = matTotal + wastageAmt + summary.labourCost + summary.transportation + summary.miscellaneous;
    const marginAmt = (subtotal * summary.contractorMargin) / 100;
    
    setSummary(prev => ({
      ...prev,
      materialTotal: matTotal,
      grandTotal: subtotal + marginAmt
    }));
  }, [materials, summary.labourCost, summary.contractorMargin, summary.wastage, summary.transportation, summary.miscellaneous]);

  const handleDetailChange = (field: keyof ProjectDetails, value: string | number | boolean) => {
    let sanitizedValue = value;
    if (field === 'builtUpArea') {
      sanitizedValue = value === "" ? 0 : Math.max(0, Number(value));
    } else if (field === 'floors') {
      sanitizedValue = value === "" ? 1 : Math.max(1, Number(value));
    } else if (field === 'sqFtRate') {
      sanitizedValue = value === "" ? 0 : Math.max(0, Number(value));
    }
    setDetails(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const handleMaterialChange = (id: string, field: 'quantity' | 'rate' | 'category' | 'name', value: string | number) => {
    let sanitizedValue = value;
    if (field === 'quantity' || field === 'rate') {
      if (value === "") {
        sanitizedValue = 0;
      } else {
        sanitizedValue = Math.max(0, Number(value));
      }
    }
    setMaterials(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: sanitizedValue };
        if (field === 'quantity' || field === 'rate') {
          updated.total = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSummaryChange = (field: keyof typeof summary, value: string | number) => {
    const numValue = value === "" ? 0 : Math.max(0, Number(value));
    setSummary(prev => ({ ...prev, [field]: numValue }));
  };

  const handleAddMaterialConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) {
      toast.error("Please enter a material name");
      return;
    }
    const newItem: MaterialItem = {
      id: crypto.randomUUID(),
      name: newMaterialName,
      category: newMaterialCategory,
      unit: newMaterialUnit,
      quantity: newMaterialQuantity || 1,
      rate: newMaterialRate || 0,
      total: (newMaterialQuantity || 1) * (newMaterialRate || 0)
    };
    setMaterials([...materials, newItem]);
    setIsAddMaterialOpen(false);
    toast.success(`${newMaterialName} added successfully!`);
    
    // Reset state
    setSelectedLibraryKey("custom_new");
    setNewMaterialName("");
    setNewMaterialCategory("Custom");
    setNewMaterialUnit("Nos");
    setNewMaterialQuantity(1);
    setNewMaterialRate(0);
  };

  const handleSave = () => {
    if (editId) {
      updateEstimate(editId, {
        details,
        materials,
        summary,
      });
      toast.success("Estimate updated successfully!");
    } else {
      const newEstimate = {
        id: crypto.randomUUID(),
        details,
        materials,
        summary,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addEstimate(newEstimate);
      toast.success("Estimate saved successfully!");
    }
    router.push("/");
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(10, 25, 47); // Navy
    doc.text("VELON CONSTRUCTIONS", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("Premium Quality Construction & Engineering", 105, 26, { align: "center" });
    
    doc.setDrawColor(197, 160, 89); // Gold
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // Project Details
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Project: ${details.projectName || "N/A"}`, 20, 42);
    doc.text(`Client: ${details.clientName || "N/A"}`, 20, 48);
    doc.text(`Location: ${details.location || "N/A"}`, 20, 54);
    doc.text(`Floors: ${details.floors <= 1 ? "Ground Floor Only" : `Ground + ${details.floors - 1}`}`, 20, 60);

    doc.text(`Date: ${details.date}`, 130, 42);
    doc.text(`Type: ${details.projectType}`, 130, 48);
    doc.text(`Area: ${details.builtUpArea} sq.ft`, 130, 54);
    doc.text(`Sq.Ft Rate: INR ${(details.sqFtRate || 0).toLocaleString()}/sq.ft`, 130, 60);

    // Items Table
    const tableData = materials.map(m => [m.name, m.category, m.quantity, m.unit, m.rate, m.total.toLocaleString()]);
    doc.autoTable({
      startY: 70,
      head: [['Material', 'Category', 'Qty', 'Unit', 'Rate (INR)', 'Amount (INR)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [10, 25, 47], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { top: 70 }
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Material Subtotal:`, 120, finalY);
    doc.text(`INR ${summary.materialTotal.toLocaleString()}`, 190, finalY, { align: "right" });
    
    doc.text(`Labour Cost:`, 120, finalY + 6);
    doc.text(`INR ${summary.labourCost.toLocaleString()}`, 190, finalY + 6, { align: "right" });
    
    doc.text(`Transportation:`, 120, finalY + 12);
    doc.text(`INR ${summary.transportation.toLocaleString()}`, 190, finalY + 12, { align: "right" });

    doc.setDrawColor(220, 225, 230);
    doc.line(120, finalY + 16, 190, finalY + 16);

    const proposalValue = details.builtUpArea * (details.sqFtRate || 0) || summary.grandTotal;
    const profit = proposalValue - summary.grandTotal;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(10, 25, 47);
    doc.text(`1. Proposal Value (Estimate):`, 120, finalY + 22);
    doc.text(`INR ${proposalValue.toLocaleString()}`, 190, finalY + 22, { align: "right" });

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80);
    doc.text(`2. Construction Expenses (BOQ):`, 120, finalY + 28);
    doc.text(`INR ${summary.grandTotal.toLocaleString()}`, 190, finalY + 28, { align: "right" });

    doc.setDrawColor(10, 25, 47);
    doc.setLineWidth(0.5);
    doc.line(120, finalY + 32, 190, finalY + 32);

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    if (profit >= 0) {
      doc.setTextColor(16, 124, 65); // Green
    } else {
      doc.setTextColor(220, 53, 69); // Red
    }
    doc.text(`Net Projected Profit (1 - 2):`, 120, finalY + 38);
    doc.text(`INR ${profit.toLocaleString()}`, 190, finalY + 38, { align: "right" });

    doc.save(`${details.projectName}_BOQ.pdf`);
    toast.success("PDF Exported");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(materials.map(m => ({
      Material: m.name,
      Category: m.category,
      Quantity: m.quantity,
      Unit: m.unit,
      Rate: m.rate,
      Total: m.total
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BOQ");
    XLSX.writeFile(wb, `${details.projectName}_BOQ.xlsx`);
    toast.success("Excel exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy">Create New Estimate</h1>
            <p className="text-sm text-muted-foreground">Follow the steps to generate a professional BOQ.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button className="bg-navy hover:bg-navy/90 text-white rounded-xl shadow-lg shadow-navy/10" onClick={handleSave}>
            <FileCheck className="w-4 h-4 mr-2" /> Finalize Estimate
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList variant="custom" className="grid grid-cols-4 w-full h-16 bg-white p-1 rounded-2xl shadow-sm premium-shadow border border-slate-100">
          <TabsTrigger value="details" className="group rounded-xl data-[state=active]:bg-navy data-[state=active]:text-white transition-all text-xs md:text-sm">
            <div className="flex items-center justify-center gap-2 w-full h-full">
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0 leading-none">1</span>
              <span className="hidden group-data-[active]:inline group-data-[state=active]:inline lg:inline font-medium">Project Details</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="quantities" className="group rounded-xl data-[state=active]:bg-navy data-[state=active]:text-white transition-all text-xs md:text-sm">
            <div className="flex items-center justify-center gap-2 w-full h-full">
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0 leading-none">2</span>
              <span className="hidden group-data-[active]:inline group-data-[state=active]:inline lg:inline font-medium">Quantities</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="group rounded-xl data-[state=active]:bg-navy data-[state=active]:text-white transition-all text-xs md:text-sm">
            <div className="flex items-center justify-center gap-2 w-full h-full">
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0 leading-none">3</span>
              <span className="hidden group-data-[active]:inline group-data-[state=active]:inline lg:inline font-medium">Rates & Pricing</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="boq" className="group rounded-xl data-[state=active]:bg-navy data-[state=active]:text-white transition-all text-xs md:text-sm">
            <div className="flex items-center justify-center gap-2 w-full h-full">
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0 leading-none">4</span>
              <span className="hidden group-data-[active]:inline group-data-[state=active]:inline lg:inline font-medium">BOQ Summary</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm premium-shadow">
              <CardHeader className="border-b border-slate-50 px-8 py-6">
                <CardTitle className="text-navy flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-gold" />
                  Basic Project Information
                </CardTitle>
                <CardDescription>Enter the core details of the construction project.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Name</Label>
                    <Input 
                      placeholder="E.g. Emerald Heights Residency" 
                      className="h-12 border-slate-200 focus:border-gold rounded-xl transition-all"
                      value={details.projectName}
                      onChange={(e) => handleDetailChange('projectName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Client Name</Label>
                    <Input 
                      placeholder="Name of the client" 
                      className="h-12 border-slate-200 focus:border-gold rounded-xl"
                      value={details.clientName}
                      onChange={(e) => handleDetailChange('clientName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Site Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="District / City" 
                        className="h-12 pl-10 border-slate-200 focus:border-gold rounded-xl"
                        value={details.location}
                        onChange={(e) => handleDetailChange('location', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="date" 
                        className="h-12 pl-10 border-slate-200 focus:border-gold rounded-xl"
                        value={details.date}
                        onChange={(e) => handleDetailChange('date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Type</Label>
                    <Select value={details.projectType} onValueChange={(v) => handleDetailChange('projectType', v || 'residential')}>
                      <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential House</SelectItem>
                        <SelectItem value="villa">Luxury Villa</SelectItem>
                        <SelectItem value="commercial">Commercial Building</SelectItem>
                        <SelectItem value="warehouse">Industrial Warehouse</SelectItem>
                        <SelectItem value="interior">Interior Fit-out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-12 h-px bg-slate-100" />

                <div className="mt-12">
                   <h3 className="text-lg font-bold text-navy mb-6 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-gold" />
                    Measurement & Structural Inputs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Built-up Area (sq.ft)</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        min="0"
                        className="h-12 border-slate-200 font-bold text-lg rounded-xl text-navy"
                        value={details.builtUpArea === 0 ? "" : details.builtUpArea}
                        onChange={(e) => handleDetailChange('builtUpArea', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sq.Ft Rate (₹/sq.ft)</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <Input 
                          type="number" 
                          placeholder="Rate per sq.ft" 
                          min="0"
                          className="h-12 pl-8 border-slate-200 font-bold text-lg rounded-xl text-navy"
                          value={details.sqFtRate === 0 || !details.sqFtRate ? "" : details.sqFtRate}
                          onChange={(e) => handleDetailChange('sqFtRate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Floors Detail</Label>
                      <Select 
                        value={String(details.floors || 1)} 
                        onValueChange={(v) => handleDetailChange('floors', Number(v))}
                      >
                        <SelectTrigger className="h-12 border-slate-200 rounded-xl font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Ground Floor Only</SelectItem>
                          <SelectItem value="2">Ground + 1 Floor</SelectItem>
                          <SelectItem value="3">Ground + 2 Floors</SelectItem>
                          <SelectItem value="4">Ground + 3 Floors</SelectItem>
                          <SelectItem value="5">Ground + 4 Floors</SelectItem>
                          <SelectItem value="6">Ground + 5 Floors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Foundation Type</Label>
                      <Select value={details.foundationType} onValueChange={(v) => handleDetailChange('foundationType', v || 'Isolated Footing')}>
                        <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Isolated Footing">Isolated Footing</SelectItem>
                          <SelectItem value="Raft Foundation">Raft Foundation</SelectItem>
                          <SelectItem value="Pile Foundation">Pile Foundation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 group">
                      <div className="flex items-center justify-between h-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Label className="text-sm font-medium cursor-pointer">Staircase Included?</Label>
                        <Switch 
                          checked={details.staircase} 
                          onCheckedChange={(v) => handleDetailChange('staircase', v)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-8 flex justify-end gap-3 rounded-b-2xl">
                <Button 
                  size="lg" 
                  className="bg-navy text-white px-8 rounded-xl"
                  onClick={() => {
                    if (details.builtUpArea <= 0) {
                      toast.error("Please enter a valid built-up area");
                      return;
                    }
                    setActiveTab("quantities");
                  }}
                >
                  Calculate Quantities <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="quantities" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm premium-shadow">
              <CardHeader className="px-8 py-6 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-navy">Auto-Calculated Material Quantities</CardTitle>
                  <CardDescription>Based on {details.builtUpArea} sq.ft {details.projectType} thumb rules.</CardDescription>
                </div>
                <Badge variant="outline" className="text-gold border-gold/30 bg-gold/5 px-4 py-1">
                  Adjustable Fields
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="pl-8 font-bold text-navy h-14">Material Name</TableHead>
                        <TableHead className="font-bold text-navy">Category</TableHead>
                        <TableHead className="font-bold text-navy">Unit</TableHead>
                        <TableHead className="font-bold text-navy w-40">Estimated Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="pl-8 py-4">
                             <Input 
                              value={item.name}
                              onChange={(e) => handleMaterialChange(item.id, 'name', e.target.value)}
                              className="bg-transparent border-none p-0 font-medium text-navy focus-visible:ring-0 focus-visible:underline"
                             />
                          </TableCell>
                          <TableCell>
                             <Input 
                              value={item.category}
                              onChange={(e) => handleMaterialChange(item.id, 'category', e.target.value)}
                              className="bg-transparent border-none p-0 text-slate-500 text-sm focus-visible:ring-0 focus-visible:underline"
                             />
                          </TableCell>
                          <TableCell><Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-md font-medium">{item.unit}</Badge></TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min="0"
                              className="w-28 h-10 border-slate-200 focus:bg-white rounded-lg font-semibold"
                              value={item.quantity === 0 ? "" : item.quantity}
                              onChange={(e) => handleMaterialChange(item.id, 'quantity', e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-emerald-50/30 hover:bg-emerald-50/30">
                        <TableCell colSpan={4} className="py-4 pl-8">
                          <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
                            <DialogTrigger render={
                              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                <Plus className="w-4 h-4 mr-2" /> Add Custom Material
                              </Button>
                            } />
                            <DialogContent className="sm:max-w-md bg-slate-900 text-white border border-white/10 p-6 rounded-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                  <Plus className="w-5 h-5 text-gold" />
                                  Add Custom Material
                                </DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleAddMaterialConfirm} className="space-y-4 py-4 text-left">
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Select from library</Label>
                                  <Select value={selectedLibraryKey} onValueChange={(v) => setSelectedLibraryKey(v || "custom_new")}>
                                    <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl text-white">
                                      <SelectValue placeholder="Custom (not in list)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 text-white border-white/10">
                                      <SelectItem value="custom_new">Custom (not in list)</SelectItem>
                                      {libraryOptions.map(option => (
                                        <SelectItem key={option.key} value={option.key} className="capitalize">
                                          {option.name} (₹{option.rate}/{option.unit})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="mat-name" className="text-xs font-bold uppercase tracking-wider text-white/50">Material Name</Label>
                                  <Input
                                    id="mat-name"
                                    className="h-11 bg-white/5 border-white/10 rounded-xl text-white px-3"
                                    value={newMaterialName}
                                    onChange={(e) => setNewMaterialName(e.target.value)}
                                    disabled={selectedLibraryKey !== "custom_new"}
                                    required
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="mat-cat" className="text-xs font-bold uppercase tracking-wider text-white/50">Category</Label>
                                    <Input
                                      id="mat-cat"
                                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white px-3"
                                      value={newMaterialCategory}
                                      onChange={(e) => setNewMaterialCategory(e.target.value)}
                                      disabled={selectedLibraryKey !== "custom_new"}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="mat-unit" className="text-xs font-bold uppercase tracking-wider text-white/50">Unit</Label>
                                    <Input
                                      id="mat-unit"
                                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white px-3"
                                      value={newMaterialUnit}
                                      onChange={(e) => setNewMaterialUnit(e.target.value)}
                                      disabled={selectedLibraryKey !== "custom_new"}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="mat-qty" className="text-xs font-bold uppercase tracking-wider text-white/50">Quantity</Label>
                                    <Input
                                      id="mat-qty"
                                      type="number"
                                      min="0.01"
                                      step="any"
                                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white px-3"
                                      value={newMaterialQuantity === 0 ? "" : newMaterialQuantity}
                                      onChange={(e) => setNewMaterialQuantity(e.target.value === "" ? 0 : Number(e.target.value))}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="mat-rate" className="text-xs font-bold uppercase tracking-wider text-white/50">Rate (₹)</Label>
                                    <Input
                                      id="mat-rate"
                                      type="number"
                                      min="0"
                                      step="any"
                                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white px-3"
                                      value={newMaterialRate === 0 ? "" : newMaterialRate}
                                      onChange={(e) => setNewMaterialRate(e.target.value === "" ? 0 : Number(e.target.value))}
                                      disabled={selectedLibraryKey !== "custom_new"}
                                      required
                                    />
                                  </div>
                                </div>

                                <DialogFooter className="pt-4 gap-2 flex justify-end">
                                  <DialogClose render={<Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl h-11 px-4" />}>
                                    Cancel
                                  </DialogClose>
                                  <Button type="submit" className="bg-gold hover:bg-gold/90 text-navy font-bold rounded-xl h-11 px-6">
                                    Add Material
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-8 flex justify-between rounded-b-2xl">
                <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setActiveTab("details")}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back to Details
                </Button>
                <Button size="lg" className="bg-navy text-white px-8 rounded-xl" onClick={() => setActiveTab("pricing")}>
                  Set Rates & Pricing <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm premium-shadow">
              <CardHeader className="px-8 py-6 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-navy flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-gold" />
                    Market Rates & Pricing Entry
                  </CardTitle>
                  <CardDescription>Enter current market rates for each material.</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Material Cost</p>
                  <p className="text-2xl font-black text-navy">₹{summary.materialTotal.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="pl-8 font-bold text-navy h-14">Material</TableHead>
                        <TableHead className="font-bold text-navy">Category</TableHead>
                        <TableHead className="font-bold text-navy text-right">Qty / Unit</TableHead>
                        <TableHead className="font-bold text-navy">Rate (₹)</TableHead>
                        <TableHead className="text-right pr-8 font-bold text-navy">Amount (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="pl-8 font-medium text-navy">{item.name}</TableCell>
                          <TableCell className="text-slate-500 text-sm italic">{item.category}</TableCell>
                          <TableCell className="text-right text-navy font-medium">{item.quantity} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-medium">₹</span>
                              <Input 
                                type="number" 
                                min="0"
                                className="w-28 h-10 border-slate-200 rounded-lg font-bold text-navy"
                                value={item.rate === 0 ? "" : item.rate}
                                onChange={(e) => handleMaterialChange(item.id, 'rate', e.target.value)}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-8 font-bold text-navy">₹{(item.quantity * item.rate).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-8 flex justify-between rounded-b-2xl">
                <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setActiveTab("quantities")}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back to Quantities
                </Button>
                <Button size="lg" className="bg-navy text-white px-8 rounded-xl" onClick={() => setActiveTab("boq")}>
                  View BOQ Summary <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="boq" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm premium-shadow">
                  <CardHeader className="bg-navy rounded-t-2xl text-white px-8 py-10 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gold rounded-lg shadow-lg">
                          <HardHat className="text-navy w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Velon Constructions</h2>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Project</p>
                          <p className="text-base font-semibold truncate" title={details.projectName}>{details.projectName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Client</p>
                          <p className="text-base font-semibold truncate" title={details.clientName}>{details.clientName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Estimate Date</p>
                          <p className="text-base font-semibold">{details.date}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Project Type</p>
                          <p className="text-base font-semibold capitalize">{details.projectType}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Built-up Area</p>
                          <p className="text-base font-semibold">{details.builtUpArea} sq.ft</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Sq.Ft Rate</p>
                          <p className="text-base font-semibold">₹{(details.sqFtRate || 0).toLocaleString()}/sq.ft</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Floors</p>
                          <p className="text-base font-semibold">
                            {details.floors <= 1 ? "Ground Only" : `Ground + ${details.floors - 1}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Foundation</p>
                          <p className="text-base font-semibold">{details.foundationType}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 border-x border-slate-50">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="pl-8 h-12 text-xs font-bold uppercase tracking-wider text-slate-500">Material / Category</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Qty</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Rate</TableHead>
                            <TableHead className="text-right pr-8 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {materials.map((m, idx) => (
                             <TableRow key={m.id} className="border-slate-50 hover:bg-slate-50/20 transition-colors">
                              <TableCell className="pl-8 py-3.5">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] text-slate-300 font-mono">{String(idx+1).padStart(2, '0')}</span>
                                  <div>
                                    <p className="font-bold text-navy text-sm">{m.name}</p>
                                    <p className="text-[10px] text-slate-400 italic">{m.category}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-500 text-xs">{m.unit}</TableCell>
                              <TableCell className="text-navy font-semibold text-xs">{m.quantity}</TableCell>
                              <TableCell className="text-navy text-xs italic">₹{m.rate}</TableCell>
                              <TableCell className="text-right pr-8 font-bold text-navy">₹{m.total.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex flex-col gap-3 rounded-b-2xl">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Material Subtotal</span>
                      <span className="font-semibold text-navy">₹{summary.materialTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Labour & Transportation</span>
                      <span className="font-semibold text-navy">₹{(summary.labourCost + summary.transportation).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">BOQ Buffer & Contractor Margin</span>
                      <span className="font-semibold text-navy">
                        ₹{(summary.grandTotal - (summary.materialTotal + summary.labourCost + summary.transportation)).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="h-px bg-slate-200/60 my-2" />

                    <div className="flex justify-between items-center text-sm pt-1">
                      <span className="text-slate-500 font-semibold">1. Project Proposal Value (Estimate)</span>
                      <span className="font-bold text-navy">
                        ₹{(details.builtUpArea * (details.sqFtRate || 0) || summary.grandTotal).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-semibold">2. Total Construction Expenses (BOQ)</span>
                      <span className="font-bold text-slate-700">
                        ₹{summary.grandTotal.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-navy/10 mt-2">
                       <span className="text-base font-extrabold text-navy">Net Projected Profit (1 - 2)</span>
                       <span className={cn(
                         "text-xl font-black tracking-tight",
                         ((details.builtUpArea * (details.sqFtRate || 0) || summary.grandTotal) - summary.grandTotal) >= 0 
                           ? "text-emerald-600" 
                           : "text-rose-600"
                       )}>
                         ₹{((details.builtUpArea * (details.sqFtRate || 0) || summary.grandTotal) - summary.grandTotal).toLocaleString()}
                       </span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-sm premium-shadow">
                  <CardHeader className="border-b border-slate-50">
                    <CardTitle className="text-lg text-navy">Project Parameters</CardTitle>
                    <CardDescription>Adjust margins and buffer charges.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Labour Cost (INR)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={summary.labourCost === 0 ? "" : summary.labourCost} 
                        onChange={(e) => handleSummaryChange('labourCost', e.target.value)}
                        className="h-11 rounded-lg font-bold text-navy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contractor Margin (%)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={summary.contractorMargin === 0 ? "" : summary.contractorMargin} 
                        onChange={(e) => handleSummaryChange('contractorMargin', e.target.value)}
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Wastage Buffer (%)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={summary.wastage === 0 ? "" : summary.wastage} 
                        onChange={(e) => handleSummaryChange('wastage', e.target.value)}
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Transportation (INR)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={summary.transportation === 0 ? "" : summary.transportation} 
                        onChange={(e) => handleSummaryChange('transportation', e.target.value)}
                        className="h-11 rounded-lg"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                   <Button 
                    className="w-full h-14 bg-navy hover:bg-navy/90 text-white rounded-xl shadow-lg border-none"
                    onClick={exportPDF}
                   >
                     <Download className="w-4 h-4 mr-2" /> Download PDF BOQ
                   </Button>
                   <Button 
                    variant="outline" 
                    className="w-full h-14 border-slate-200 rounded-xl bg-white hover:bg-slate-50"
                    onClick={exportExcel}
                   >
                     <Share2 className="w-4 h-4 mr-2" /> Export to Excel
                   </Button>
                   <Button 
                    variant="outline" 
                    className="w-full h-14 border-slate-200 rounded-xl bg-white hover:bg-slate-50"
                    onClick={() => window.print()}
                   >
                     <Printer className="w-4 h-4 mr-2" /> Print Estimate
                   </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default function NewEstimate() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold">Loading estimate details...</div>}>
      <NewEstimateForm />
    </Suspense>
  );
}

