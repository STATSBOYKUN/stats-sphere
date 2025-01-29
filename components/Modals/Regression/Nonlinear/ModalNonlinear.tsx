// components/Modals/Nonlinear/ModalNonlinear.tsx

import React, { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Pencil, ArrowRight } from 'lucide-react';

// Ambil store variabel dan data
import { useVariableStore } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface ModalNonlinearProps {
  onClose: () => void;
}

const ModalNonlinear: React.FC<ModalNonlinearProps> = ({ onClose }) => {
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);

  // State untuk Dependent & Model Expression
  const [dependentVariable, setDependentVariable] = useState<Variable | null>(null);
  const [modelExpression, setModelExpression] = useState<string>('');

  // Bagian Function Group (di bawah keypad)
  const [functionGroup, setFunctionGroup] = useState<string>('All');

  // Ambil data variabel & data (opsional) dari store
  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  // Pada mount / saat `variables` berubah, siapkan daftar variabel yang tersedia
  useEffect(() => {
    const mappedVars: Variable[] = variables
      .filter((v) => v.name) // filter variabel tanpa nama
      .map((v) => ({
        name: v.name,
        type: v.type as 'numeric' | 'categorical',
        columnIndex: v.columnIndex,
      }));
    setAvailableVariables(mappedVars);
  }, [variables]);

  // Handler menyorot variabel
  const handleSelectVariable = (variable: Variable) => {
    setHighlightedVariable(variable);
  };

  // Memindahkan variabel ke Dependent
  const handleMoveToDependent = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      // Kembalikan Dependent lama ke available (jika ada)
      if (dependentVariable) {
        setAvailableVariables((prev) => [...prev, dependentVariable]);
      }
      setDependentVariable(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((v) => v !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  // Klik Dependent area untuk menghapus isian
  const handleRemoveDependent = () => {
    if (dependentVariable) {
      setAvailableVariables((prev) => [...prev, dependentVariable]);
      setDependentVariable(null);
    }
  };

  // Memindahkan variabel ke Model Expression
  const handleMoveToExpression = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      // Tambahkan nama variabel ke expression
      setModelExpression((prev) =>
        prev ? `${prev} + ${highlightedVariable.name}` : highlightedVariable.name
      );
      // Hapus dari daftar left panel
      setAvailableVariables((prev) => prev.filter((v) => v !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  // Keypad - menambahkan simbol ke expression
  const handleAddSymbol = (symbol: string) => {
    setModelExpression((prev) => `${prev}${symbol}`);
  };

  // Keypad - hapus seluruh expression
  const handleDeleteExpression = () => {
    setModelExpression('');
  };

  // Tombol aksi di panel kanan
  const handleLoss = () => {
    alert('Loss belum diimplementasikan.');
  };

  const handleConstraints = () => {
    alert('Constraints belum diimplementasikan.');
  };

  const handleSave = () => {
    alert('Save belum diimplementasikan.');
  };

  const handleOptions = () => {
    alert('Options belum diimplementasikan.');
  };

  // Footer: OK, Paste, Reset, Cancel, Help
  const handleOK = () => {
    // Lakukan aksi OK (misal: validasi, submit, dsb.)
    onClose();
  };

  const handlePaste = () => {
    alert('Paste belum diimplementasikan.');
  };

  const handleReset = () => {
    // Kembalikan semua ke kondisi awal
    setDependentVariable(null);
    setModelExpression('');
    setHighlightedVariable(null);
    setFunctionGroup('All');
    // Kembalikan semua variabel store
    const mappedVars: Variable[] = variables
      .filter((v) => v.name)
      .map((v) => ({
        name: v.name,
        type: v.type as 'numeric' | 'categorical',
        columnIndex: v.columnIndex,
      }));
    setAvailableVariables(mappedVars);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleHelp = () => {
    alert('Help belum diimplementasikan.');
  };

  return (
    <DialogContent className="sm:max-w-[900px]">
      <DialogHeader className="flex justify-between items-center">
        <DialogTitle>Nonlinear Regression</DialogTitle>
      </DialogHeader>

      <Separator className="my-2" />

      {/* Grid: 3 kolom utama */}
      <div className="grid grid-cols-12 gap-4">
        {/* PANEL KIRI: Daftar Variabel */}
        <div className="col-span-3 border p-4 rounded-md max-h-[500px] overflow-y-auto">
          <label className="font-semibold">Daftar Variabel</label>
          <ScrollArea className="mt-2 h-[450px]">
            {availableVariables.map((variable) => (
              <div
                key={variable.name}
                className={`flex items-center p-2 border cursor-pointer rounded-md hover:bg-gray-100 mb-1 ${
                  highlightedVariable?.name === variable.name
                    ? 'bg-blue-100 border-blue-500'
                    : 'border-gray-300'
                }`}
                onClick={() => handleSelectVariable(variable)}
              >
                <Pencil className="h-4 w-4 mr-2 text-yellow-500" />
                {variable.name}
              </div>
            ))}
          </ScrollArea>

          {/* Tombol Parameters... (placeholder) */}
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => alert('Parameters belum diimplementasikan.')}
          >
            Parameters...
          </Button>
        </div>

        {/* PANEL TENGAH: Dependent, Model Expression, Keypad, Function Group */}
        <div className="col-span-6 flex flex-col space-y-2">
          {/* Baris 1: Dependent */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleMoveToDependent}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              title="Set as Dependent"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold text-sm">Dependent:</label>
              <Input
                className="mt-1 cursor-pointer"
                readOnly
                value={dependentVariable?.name || ''}
                placeholder="[Kosong]"
                onClick={handleRemoveDependent}
              />
            </div>
          </div>

          {/* Baris 2: Model Expression */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleMoveToExpression}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              title="Add to Model Expression"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold text-sm">Model Expression:</label>
              <Textarea
                className="mt-1"
                rows={1}
                value={modelExpression}
                onChange={(e) => setModelExpression(e.target.value)}
              />
            </div>
          </div>

          {/* Keypad */}
          <div>
            <label className="font-semibold text-sm">Keypad:</label>
            <div className="grid grid-cols-5 gap-1 mt-1">
              {/* Row 1 */}
              <Button variant="outline" onClick={() => handleAddSymbol(' + ')}>
                +
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' <= ')}>
                &lt;=
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 7 ')}>
                7
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 8 ')}>
                8
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 9 ')}>
                9
              </Button>

              {/* Row 2 */}
              <Button variant="outline" onClick={() => handleAddSymbol(' - ')}>
                -
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' >= ')}>
                &gt;=
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 4 ')}>
                4
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 5 ')}>
                5
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 6 ')}>
                6
              </Button>

              {/* Row 3 */}
              <Button variant="outline" onClick={() => handleAddSymbol(' * ')}>
                *
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' ~= ')}>
                ~= 
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 1 ')}>
                1
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 2 ')}>
                2
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 3 ')}>
                3
              </Button>

              {/* Row 4 */}
              <Button variant="outline" onClick={() => handleAddSymbol(' / ')}>
                /
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' != ')}>
                !=
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' 0 ')}>
                0
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' . ')}>
                .
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' ( ) ')}>
                ( )
              </Button>

              {/* Row 5 */}
              <Button variant="outline" onClick={() => handleAddSymbol(' ** ')}>
                **
              </Button>
              <Button variant="outline" onClick={() => handleAddSymbol(' | ')}>
                |
              </Button>
              <Button
                variant="outline"
                className="col-span-3"
                onClick={handleDeleteExpression}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Function Group - Di bawah keypad */}
          <div className="mt-2">
            <label className="font-semibold text-sm">Function Group:</label>
            <Select value={functionGroup} onValueChange={setFunctionGroup}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Arithmetic">Arithmetic</SelectItem>
                <SelectItem value="CDF & Noncentral CDF">
                  CDF &amp; Noncentral CDF
                </SelectItem>
                <SelectItem value="Conversion">Conversion</SelectItem>
                <SelectItem value="Current Date/Time">Current Date/Time</SelectItem>
                <SelectItem value="Date Arithmetic">Date Arithmetic</SelectItem>
                <SelectItem value="Date Creation">Date Creation</SelectItem>
                <SelectItem value="Date Extraction">Date Extraction</SelectItem>
                {/* dll. */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* PANEL KANAN: Tombol Loss, Constraints, Save, Options */}
        <div className="col-span-3 flex flex-col space-y-2">
          <Button variant="outline" onClick={handleLoss}>
            Loss...
          </Button>
          <Button variant="outline" onClick={handleConstraints}>
            Constraints...
          </Button>
          <Button variant="outline" onClick={handleSave}>
            Save...
          </Button>
          <Button variant="outline" onClick={handleOptions}>
            Options...
          </Button>
        </div>
      </div>

      {/* Footer: OK, Paste, Reset, Cancel, Help */}
      <DialogFooter className="flex justify-center space-x-3 mt-4">
        <Button
          variant="default"
          onClick={handleOK}
          disabled={!dependentVariable && !modelExpression}
        >
          OK
        </Button>
        <Button variant="outline" onClick={handlePaste}>
          Paste
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleHelp}>
          Help
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModalNonlinear;
