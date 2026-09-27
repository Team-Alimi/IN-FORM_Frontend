import React, { useState, useEffect } from 'react';
import { getVendorList } from '@/api/manage/api/adminArticleEdit';
import type { FormVendorListComponent } from '@/api/manage/dto/adminDto';

const VendorAddModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: (id: number, name: string, url: string) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState({
    vendor_id: 0,
    vendor_name: '',
    vendor_url: '',
  });
  const [vendors, setVendors] = useState<FormVendorListComponent[]>([]);

  useEffect(() => {
    const loadVendors = async () => {
      const data = await getVendorList();
      setVendors(data);
    };
    loadVendors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onConfirm(form.vendor_id, form.vendor_name, form.vendor_url);
  };
  return (
    <div className="border bg-white rounded-lg p-4 flex flex-col gap-1 px-6 w-1/2">
      <div>
        <div className="mb-2">
          <span>출처명</span>
          <div className="border rounded overflow-y-auto max-h-48 p-2 grid grid-cols-4 gap-1">
            {vendors.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-1 cursor-pointer"
              >
                <input
                  type="radio"
                  checked={form.vendor_id === item.id}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      vendor_id: item.id ?? 0,
                      vendor_name: item.name ?? '',
                      vendor_url: item.homepage_url ?? prev.vendor_url,
                    }))
                  }
                />
                {item.name}
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
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="p-1 bg-blue-200 px-4 rounded-md m-2"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
export default VendorAddModal;
