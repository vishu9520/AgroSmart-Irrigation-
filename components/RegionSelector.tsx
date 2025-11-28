
import React from 'react';
import type { Region } from '../data/regions';

interface RegionSelectorProps {
  regions: Region[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  divisions: string[];
  selectedDivision: string;
  onDivisionChange: (division: string) => void;
  zillas: string[];
  selectedZilla: string;
  onZillaChange: (zilla: string) => void;
  upazilas: string[];
  selectedUpazila: string;
  onUpazilaChange: (upazila: string) => void;
}

const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }> = ({ label, options, ...props }) => (
    <div className="flex-1">
        <label htmlFor={props.id} className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
        <select
            {...props}
            className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
            <option value="">-- Select {label} --</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  regions,
  selectedCountry,
  onCountryChange,
  divisions,
  selectedDivision,
  onDivisionChange,
  zillas,
  selectedZilla,
  onZillaChange,
  upazilas,
  selectedUpazila,
  onUpazilaChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SelectInput
        id="country-select"
        label="Country"
        value={selectedCountry}
        onChange={(e) => onCountryChange(e.target.value)}
        options={regions.map(r => r.name)}
      />
      <SelectInput
        id="division-select"
        label="Division / State"
        value={selectedDivision}
        onChange={(e) => onDivisionChange(e.target.value)}
        options={divisions}
        disabled={!selectedCountry}
      />
      <SelectInput
        id="zilla-select"
        label="Zilla / County"
        value={selectedZilla}
        onChange={(e) => onZillaChange(e.target.value)}
        options={zillas}
        disabled={!selectedDivision}
      />
      <SelectInput
        id="upazila-select"
        label="Upazila / City"
        value={selectedUpazila}
        onChange={(e) => onUpazilaChange(e.target.value)}
        options={upazilas}
        disabled={!selectedZilla}
      />
    </div>
  );
};
