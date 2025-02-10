// components/OptionsLinear.tsx
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

interface OptionsLinearProps {
  onClose: () => void;
}

const OptionsLinear: React.FC<OptionsLinearProps> = ({ onClose }) => {
  // State untuk Stepping Method Criteria
  const [steppingMethod, setSteppingMethod] = useState<'probability' | 'fvalue'>('probability');
  const [probEntry, setProbEntry] = useState('0.05');
  const [probRemoval, setProbRemoval] = useState('0.10');
  const [fvalueEntry, setFvalueEntry] = useState('3.84');
  const [fvalueRemoval, setFvalueRemoval] = useState('2.71');

  // State untuk Include constant in equation
  const [includeConstant, setIncludeConstant] = useState(false);

  // State untuk Missing Values
  const [missingValue, setMissingValue] = useState<'listwise' | 'pairwise' | 'replace'>('listwise');

  return (
    <DialogContent className="sm:max-w-[800px] relative">
      {/* Header */}
      <DialogHeader>
        <DialogTitle className="text-lg">Linear Regression: Options</DialogTitle>
      </DialogHeader>

      <Separator className="my-2" />

      {/* Stepping Method Criteria */}
      <div className="border rounded p-4 mb-4">
        <h3 className="font-semibold mb-2">Stepping Method Criteria</h3>
        <div className="flex flex-col space-y-4">
          {/* Option 1: Use probability of F */}
          <div>
            <div className="flex items-center">
              <input
                type="radio"
                name="steppingMethod"
                id="steppingProbability"
                value="probability"
                checked={steppingMethod === 'probability'}
                onChange={() => setSteppingMethod('probability')}
                className="accent-gray-500"
              />
              <label htmlFor="steppingProbability" className="ml-2 text-sm">
                Use probability of F
              </label>
            </div>
            <div className="ml-6 mt-2 grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <label htmlFor="probEntry" className="mr-2 text-sm">
                  Entry:
                </label>
                <Input
                  type="text"
                  id="probEntry"
                  value={probEntry}
                  onChange={(e) => setProbEntry(e.target.value)}
                  className="w-20 p-1 text-sm"
                  disabled={steppingMethod !== 'probability'}
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="probRemoval" className="mr-2 text-sm">
                  Removal:
                </label>
                <Input
                  type="text"
                  id="probRemoval"
                  value={probRemoval}
                  onChange={(e) => setProbRemoval(e.target.value)}
                  className="w-20 p-1 text-sm"
                  disabled={steppingMethod !== 'probability'}
                />
              </div>
            </div>
          </div>

          {/* Option 2: Use F value */}
          <div>
            <div className="flex items-center">
              <input
                type="radio"
                name="steppingMethod"
                id="steppingFvalue"
                value="fvalue"
                checked={steppingMethod === 'fvalue'}
                onChange={() => setSteppingMethod('fvalue')}
                className="accent-gray-500"
              />
              <label htmlFor="steppingFvalue" className="ml-2 text-sm">
                Use F value
              </label>
            </div>
            <div className="ml-6 mt-2 grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <label htmlFor="fvalueEntry" className="mr-2 text-sm">
                  Entry:
                </label>
                <Input
                  type="text"
                  id="fvalueEntry"
                  value={fvalueEntry}
                  onChange={(e) => setFvalueEntry(e.target.value)}
                  className="w-20 p-1 text-sm"
                  disabled={steppingMethod !== 'fvalue'}
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="fvalueRemoval" className="mr-2 text-sm">
                  Removal:
                </label>
                <Input
                  type="text"
                  id="fvalueRemoval"
                  value={fvalueRemoval}
                  onChange={(e) => setFvalueRemoval(e.target.value)}
                  className="w-20 p-1 text-sm"
                  disabled={steppingMethod !== 'fvalue'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Include constant in equation */}
      <div className="mb-4">
        <div className="flex items-center">
          <Checkbox
            checked={includeConstant}
            onCheckedChange={(checked) => setIncludeConstant(!!checked)}
            id="includeConstant"
          />
          <label htmlFor="includeConstant" className="ml-2 text-sm">
            Include constant in equation
          </label>
        </div>
      </div>

      {/* Missing Values */}
      <div className="border rounded p-4 mb-4">
        <h3 className="font-semibold mb-2">Missing Values</h3>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              name="missingValues"
              id="excludeListwise"
              value="listwise"
              checked={missingValue === 'listwise'}
              onChange={(e) => setMissingValue(e.target.value as 'listwise' | 'pairwise' | 'replace')}
              className="accent-gray-500"
            />
            <label htmlFor="excludeListwise" className="ml-2 text-sm">
              Exclude cases listwise
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              name="missingValues"
              id="excludePairwise"
              value="pairwise"
              checked={missingValue === 'pairwise'}
              onChange={(e) => setMissingValue(e.target.value as 'listwise' | 'pairwise' | 'replace')}
              className="accent-gray-500"
            />
            <label htmlFor="excludePairwise" className="ml-2 text-sm">
              Exclude cases pairwise
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              name="missingValues"
              id="replaceMean"
              value="replace"
              checked={missingValue === 'replace'}
              onChange={(e) => setMissingValue(e.target.value as 'listwise' | 'pairwise' | 'replace')}
              className="accent-gray-500"
            />
            <label htmlFor="replaceMean" className="ml-2 text-sm">
              Replace with mean
            </label>
          </div>
        </div>
      </div>

      {/* Tombol Aksi */}
      <DialogFooter className="flex justify-end space-x-3 mt-4">
        <Button
          variant="default"
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => alert('Continue')}
        >
          Continue
        </Button>
        <Button variant="outline" onClick={() => alert('Cancel')}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => alert('Help')}>
          Help
        </Button>
      </DialogFooter>

      {/* Tombol Close (X) */}
      <div className="absolute top-2 right-2">
        <Button variant="ghost" onClick={onClose}>
          X
        </Button>
      </div>
    </DialogContent>
  );
};

export default OptionsLinear;
