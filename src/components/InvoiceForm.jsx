import React, { useState } from 'react';
import { uid } from 'uid';
import axios from 'axios';
import InvoiceItem from './InvoiceItem';
import { saveAs } from 'file-saver';
import incrementString from '../helpers/incrementString';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const InvoiceForm = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('00007');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [loader, setLoder] = useState(false);
  const [estimateDate, setestimateDate] = useState(new Date());
  const [items, setItems] = useState([
    {
      id: uid(6),
      name: '',
      qty: '',
      amount: '1.00',
      rate: '',
      discount: 0,
    },
  ]);
  const tax = 9;

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoder(true);
    const data = {
      invoiceNumber,
      companyName,
      city,
      street,
      state,
      zip,
      gstin,
      items,
      estimateDate
    };
    try {
      const response = await axios.post(
        'http://localhost:11000/getInvoice',
        data,
        {
          responseType: 'blob',
        }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, 'file.pdf');
    } catch (error) {
      console.log(error);
    }
    addNextInvoiceHandler();
    setLoder(false);
  };

  const addNextInvoiceHandler = () => {
    setInvoiceNumber((prevNumber) => incrementString(prevNumber));
    setCompanyName('');
    setGstin('');
    setState('');
    setCity('');
    setZip('');
    setStreet('');
    setItems([
      {
        id: uid(6),
        name: '',
        qty: '',
        amount: '1.00',
        rate: '',
        discount: 0,
      },
    ]);
  };

  const addItemHandler = () => {
    const id = uid(6);
    setItems((prevItem) => [
      ...prevItem,
      {
        id: id,
        name: '',
        qty: '',
        amount: '',
        rate: '',
        discount: 0,
      },
    ]);
  };
  const deleteItemHandler = (id) => {
    setItems((prevItem) => prevItem.filter((item) => item.id !== id));
  };

  const edtiItemHandler = (event) => {
    const editedItem = {
      id: event.target.id,
      name: event.target.name,
      value: event.target.value,
    };
    const newItems = items.map((items) => {
      for (const key in items) {
        if (key === editedItem.name && items.id === editedItem.id) {
          items[key] = editedItem.value;
        }
      }
      items.amount =
        items.qty * items.rate * (1 - items.discount / 100).toFixed(2);
      return items;
    });
    setItems(newItems);
  };
  const totalAmountAfterDiscount = items.reduce(
    (acc, item) => acc + (item.qty * item.rate * (100 - item.discount)) / 100,
    0
  );
  const cgstTax = (totalAmountAfterDiscount * tax) / 100;
  const sgstTax = (totalAmountAfterDiscount * tax) / 100;

  const total = totalAmountAfterDiscount + cgstTax + sgstTax;
  return (
    <form
      className="relative flex flex-col px-2 md:flex-row"
      onSubmit={onSubmitHandler}
    >
      <div className="my-6 flex-1 space-y-2  rounded-md bg-white p-4 shadow-sm sm:space-y-4 md:p-6">
        <div className="flex flex-col justify-between space-y-2 border-b border-gray-900/10 pb-4 md:flex-row md:items-center md:space-y-0">
          <div className="flex items-center space-x-2">
            <label className="font-bold" htmlFor="invoiceNumber">
              Invoice Number:
            </label>
            <input
              required
              className="max-w-[130px]"
              type="number"
              name="invoiceNumber"
              id="invoiceNumber"
              min="1"
              step="1"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <span className="font-bold">Estimate Date: </span>
            <DatePicker
              selected={estimateDate}
              dateFormat="dd/MM/yyyy"
              onChange={(date) => setestimateDate(date)}
            />
          </div>
        </div>
        <h1 className="text-center text-lg font-bold">INVOICE</h1>
        <label htmlFor="cashierName" className="text-sm font-bold sm:text-base">
          Bill To:
        </label>
        <div className="grid grid-cols-2 gap-2 pt-4 pb-8">
          <input
            required
            className="flex-1"
            placeholder="Company name"
            type="text"
            name="companyName"
            autoCapitalize="words"
            id="companyName"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />
          <input
            required
            className="flex-1"
            placeholder="GSTIN"
            type="text"
            name="gstin"
            id="gstin"
            value={gstin}
            onChange={(event) => setGstin(event.target.value)}
          />
          <input
            required
            className="flex-1"
            placeholder="City"
            type="text"
            name="city"
            autoCapitalize="on"
            id="city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <input
            required
            className="flex-1"
            placeholder="Street"
            type="text"
            name="street"
            autoCapitalize="on"
            id="street"
            value={street}
            onChange={(event) => setStreet(event.target.value)}
          />
          <input
            required
            className="flex-1"
            placeholder="State"
            type="text"
            autoCapitalize="on"
            name="state"
            id="state"
            value={state}
            onChange={(event) => setState(event.target.value)}
          />
          <input
            required
            className="flex-1"
            placeholder="ZIP Code"
            type="number"
            name="zip"
            id="zip"
            value={zip}
            onChange={(event) => setZip(event.target.value)}
          />
        </div>
        <table className="w-full p-4 text-left">
          <thead>
            <tr className="border-b border-gray-900/10 text-sm md:text-base">
              <th>ITEM & DESCRIPTION</th>
              <th>QTY</th>
              <th className="text-center">RATE</th>
              <th className="text-center">DIS %</th>
              <th className="text-center">CGST %</th>
              <th className="text-center">SGST %</th>
              <th className="text-center">AMOUNT</th>
              <th className="text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <InvoiceItem
                key={item.id}
                id={item.id}
                name={item.name}
                qty={item.qty}
                rate={item.rate}
                discount={item.discount}
                cgst={item.cgst}
                sgst={item.sgst}
                amount={item.amount}
                onDeleteItem={deleteItemHandler}
                onEdtiItem={edtiItemHandler}
              />
            ))}
          </tbody>
        </table>
        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-600"
          type="button"
          onClick={addItemHandler}
        >
          Add Item
        </button>
        <div className="flex flex-col items-end space-y-2 pt-6">
          <div className="flex w-full justify-between md:w-1/2">
            <span className="font-bold">Subtotal:</span>
            <span>₹{totalAmountAfterDiscount.toFixed(2)}</span>
          </div>
          <div className="flex w-full justify-between md:w-1/2">
            <span className="font-bold">CGST:</span>
            <span>
              ({tax || '0'}%)₹{cgstTax.toFixed(2)}
            </span>
          </div>
          <div className="flex w-full justify-between md:w-1/2">
            <span className="font-bold">SGST:</span>
            <span>
              ({tax || '0'}%)₹{sgstTax.toFixed(2)}
            </span>
          </div>
          <div className="flex w-full justify-between border-t border-gray-900/10 pt-2 md:w-1/2">
            <span className="font-bold">Total:</span>
            <span className="font-bold">
              ₹{total % 1 === 0 ? total : total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <div className="basis-1/4 bg-transparent">
        <div className="sticky top-0 z-10 space-y-4 divide-y divide-gray-900/10 pb-8 md:pt-6 md:pl-4">
          <button
            className="w-full rounded-md bg-blue-500 py-2 text-sm text-white shadow-sm hover:bg-blue-600"
            type="submit"
            disabled={loader}
          >
            {!loader ? 'Download Invoice' : 'Please Wait ...'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
