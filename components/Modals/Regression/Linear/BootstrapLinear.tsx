// components/BootstrapLinear.tsx
import React, { useState } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface BootstrapLinearProps {
  onClose: () => void;
}

const BootstrapLinear: React.FC<BootstrapLinearProps> = ({ onClose }) => {
  // State untuk bagian utama bootstrap
  const [performBootstrapping, setPerformBootstrapping] = useState(false);
  const [numberOfSamples, setNumberOfSamples] = useState('1000');
  const [setSeed, setSetSeed] = useState(false);
  const [seedValue, setSeedValue] = useState('2000000');

  // State untuk Confidence Intervals
  const [confidenceLevel, setConfidenceLevel] = useState('95');
  const [ciMethod, setCiMethod] = useState<'Percentile' | 'BCa'>('Percentile');

  // State untuk Sampling
  const [samplingMethod, setSamplingMethod] = useState<'Simple' | 'Stratified'>('Simple');
  const [variables, setVariables] = useState<string[]>(['VAR00001', 'VAR00002']);
  const [strataVariables, setStrataVariables] = useState<string[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);

  // Fungsi untuk memindahkan variabel dari box Variables ke box Strata Variables
  const moveVariable = () => {
    if (selectedVariable) {
      setVariables(variables.filter((v) => v !== selectedVariable));
      setStrataVariables([...strataVariables, selectedVariable]);
      setSelectedVariable(null);
    }
  };

  return (
    // Perbaikan: Ubah className pada DialogContent agar menggunakan max-h-[90vh] dan overflow-y-auto
    // sehingga modal tampil terpusat dan kontennya dapat discroll bila terlalu panjang.
    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
      {/* Header dengan judul */}
      <DialogHeader>
        <DialogTitle className="text-lg">Bootstrap</DialogTitle>
      </DialogHeader>
      <Separator className="my-2" />

      <div className="p-4 space-y-6">
        {/* Bagian Pengaturan Utama */}
        <div>
          {/* Checkbox Perform bootstrapping */}
          <div className="flex items-center mb-4">
            <Checkbox
              id="performBootstrapping"
              checked={performBootstrapping}
              onCheckedChange={(checked) => setPerformBootstrapping(!!checked)}
            />
            <label htmlFor="performBootstrapping" className="ml-2 text-sm">
              Perform bootstrapping
            </label>
          </div>

          {/* Opsi Number of samples */}
          <div className="mb-4">
            <label htmlFor="numberOfSamples" className="block text-sm mb-1">
              Number of samples:
            </label>
            <Input
              id="numberOfSamples"
              type="number"
              value={numberOfSamples}
              onChange={(e) => setNumberOfSamples(e.target.value)}
              disabled={!performBootstrapping}
              className="w-32 p-1 text-sm"
            />
          </div>

          {/* Opsi Set seed for Mersenne Twister */}
          <div className="mb-4">
            <div className="flex items-center">
              <Checkbox
                id="setSeed"
                checked={setSeed}
                onCheckedChange={(checked) => setSetSeed(!!checked)}
                disabled={!performBootstrapping}
              />
              <label htmlFor="setSeed" className="ml-2 text-sm">
                Set seed for Mersenne Twister
              </label>
            </div>
            <div className="mt-2">
              <label htmlFor="seedValue" className="block text-sm mb-1">
                Seed:
              </label>
              <Input
                id="seedValue"
                type="number"
                value={seedValue}
                onChange={(e) => setSeedValue(e.target.value)}
                disabled={!performBootstrapping || !setSeed}
                className="w-32 p-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bagian Confidence Intervals */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Confidence Intervals</h3>
          <div className="mb-2">
            <label htmlFor="confidenceLevel" className="block text-sm mb-1">
              Level(%):
            </label>
            <Input
              id="confidenceLevel"
              type="number"
              placeholder="95"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(e.target.value)}
              disabled={!performBootstrapping}
              className="w-16 p-1 text-sm"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="ciPercentile"
                name="ciMethod"
                value="Percentile"
                checked={ciMethod === 'Percentile'}
                onChange={() => setCiMethod('Percentile')}
                disabled={!performBootstrapping}
                className="accent-gray-500"
              />
              <label htmlFor="ciPercentile" className="ml-2 text-sm">
                Percentile
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="ciBCa"
                name="ciMethod"
                value="BCa"
                checked={ciMethod === 'BCa'}
                onChange={() => setCiMethod('BCa')}
                disabled={!performBootstrapping}
                className="accent-gray-500"
              />
              <label htmlFor="ciBCa" className="ml-2 text-sm">
                Bias corrected accelerated (BCa)
              </label>
            </div>
          </div>
        </div>

        {/* Bagian Sampling */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Sampling</h3>
          <div className="mb-2 flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="samplingSimple"
                name="samplingMethod"
                value="Simple"
                checked={samplingMethod === 'Simple'}
                onChange={() => setSamplingMethod('Simple')}
                className="accent-gray-500"
              />
              <label htmlFor="samplingSimple" className="ml-2 text-sm">
                Simple
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="samplingStratified"
                name="samplingMethod"
                value="Stratified"
                checked={samplingMethod === 'Stratified'}
                onChange={() => setSamplingMethod('Stratified')}
                className="accent-gray-500"
              />
              <label htmlFor="samplingStratified" className="ml-2 text-sm">
                Stratified
              </label>
            </div>
          </div>

          <div className="flex space-x-4">
            {/* Kotak Variables */}
            <div className="border rounded p-2 w-1/2">
              <p className="text-sm font-semibold mb-2">Variables</p>
              <ul className="space-y-1">
                {variables.map((variable) => (
                  <li
                    key={variable}
                    className={`p-1 rounded cursor-pointer text-sm ${
                      selectedVariable === variable ? 'bg-blue-200' : ''
                    }`}
                    onClick={() => setSelectedVariable(variable)}
                  >
                    {variable}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tombol panah untuk memindahkan variabel */}
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={moveVariable}
                disabled={samplingMethod !== 'Stratified' || !selectedVariable}
              >
                &gt;
              </Button>
            </div>

            {/* Kotak Strata Variables */}
            <div className="border rounded p-2 w-1/2">
              <p className="text-sm font-semibold mb-2">Strata Variables</p>
              {strataVariables.length === 0 ? (
                <p className="text-xs text-gray-500">No strata variables</p>
              ) : (
                <ul className="space-y-1">
                  {strataVariables.map((variable) => (
                    <li key={variable} className="p-1 rounded text-sm">
                      {variable}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Navigasi di bagian bawah */}
      <DialogFooter className="flex justify-between mt-4">
        <Button
          variant="default"
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => alert('Continue')}
        >
          Continue
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => alert('Help')}>
          Help
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default BootstrapLinear;
