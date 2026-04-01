import React, { useState, useEffect } from 'react';
import { getVendors } from '@/api/getVendors';

const VendorAddModal = () => {
  const [form, setForm] = useState({
    vendor_name: '',
    vendor_url: '',
  });
  const [vendors, setVendors] = useState<
    { vendor_id: number; vendor_name: string }[]
  >([]);

  useEffect(() => {
    getVendors('SCHOOL')
      .then((res) => setVendors(res.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    alert(`출처학과 : ${form.vendor_name}\n출처URL : ${form.vendor_url}`);
  };
  return (
    <div className="border-1 p-4 flex flex-col gap-1 px-6">
      <div>
        <div className="mb-2">
          <span>출처명</span>
          <div className="border rounded overflow-y-auto max-h-48 p-2 grid grid-cols-4 gap-1">
            {vendors.map((item) => (
              <label
                key={item.vendor_id}
                className="flex items-center gap-1 cursor-pointer"
              >
                <input
                  name="vendor_name"
                  value={item.vendor_name}
                  type="radio"
                  checked={form.vendor_name === item.vendor_name}
                  onChange={handleChange}
                />
                {item.vendor_name}
              </label>
            ))}
          </div>
        </div>
        <label className="flex flex-row w-full items-center gap-2">
          <span className="shrink-0">출처 URL</span>
          <input
            name="vendor_url"
            value={form.vendor_url}
            onChange={handleChange}
            className="w-full"
          />
        </label>
        <div className="flex justify-end">
          <button type="button" onClick={handleSubmit} className="p-1 bg-blue-200 px-4 rounded-md m-2">
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
export default VendorAddModal;
