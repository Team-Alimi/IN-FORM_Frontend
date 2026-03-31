import { useState } from 'react';

const VendorAddModal = () => {
  const [form, setForm] = useState({
    vendor_name: '',
    vendor_url: '',
  });
  return (
    <div>
      <form>
        <label>
          출처명 : <input name="vendor_name" value="vendor_name" />
        </label>
        <label>출처 URL :</label>
      </form>
    </div>
  );
};
export default VendorAddModal;
