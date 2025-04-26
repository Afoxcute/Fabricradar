'use client'

import React, { useState } from 'react'
import Modal from '../ui/modal'
import { Button } from '../ui/button'
import { ExternalLink } from 'lucide-react'

interface SmartContractModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
}

const deliveryMethods = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'shipping', label: 'Shipping' },
]

const paymentMethods = [
  { id: 'crypto', label: 'Cryptocurrency' },
]

export default function SmartContractModal({ 
  isOpen, 
  onClose, 
  productName 
}: SmartContractModalProps) {
  const [measurements, setMeasurements] = useState({
    height: '',
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    armLength: '',
    inseam: '',
  })
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    timeline: '14', // Default timeline (days)
    deliveryMethod: 'shipping',
    address: '',
    paymentMethod: 'crypto',
  })
  
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMeasurements(prev => ({ ...prev, [name]: value }))
  }
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handlePaymentClick = () => {
    window.open('https://google.com', '_blank')
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Initiate Smart Contract for ${productName}`}
    >
      <div className="space-y-6">
        {/* Measurements Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Your Measurements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">
                Height (cm)
              </label>
              <input
                type="text"
                id="height"
                name="height"
                value={measurements.height}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 175"
              />
            </div>
            
            <div>
              <label htmlFor="chest" className="block text-sm font-medium text-gray-300 mb-1">
                Chest (cm)
              </label>
              <input
                type="text"
                id="chest"
                name="chest"
                value={measurements.chest}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 92"
              />
            </div>
            
            <div>
              <label htmlFor="waist" className="block text-sm font-medium text-gray-300 mb-1">
                Waist (cm)
              </label>
              <input
                type="text"
                id="waist"
                name="waist"
                value={measurements.waist}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 84"
              />
            </div>
            
            <div>
              <label htmlFor="hips" className="block text-sm font-medium text-gray-300 mb-1">
                Hips (cm)
              </label>
              <input
                type="text"
                id="hips"
                name="hips"
                value={measurements.hips}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 98"
              />
            </div>
            
            <div>
              <label htmlFor="shoulder" className="block text-sm font-medium text-gray-300 mb-1">
                Shoulder Width (cm)
              </label>
              <input
                type="text"
                id="shoulder"
                name="shoulder"
                value={measurements.shoulder}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 45"
              />
            </div>
            
            <div>
              <label htmlFor="armLength" className="block text-sm font-medium text-gray-300 mb-1">
                Arm Length (cm)
              </label>
              <input
                type="text"
                id="armLength"
                name="armLength"
                value={measurements.armLength}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 65"
              />
            </div>
            
            <div>
              <label htmlFor="inseam" className="block text-sm font-medium text-gray-300 mb-1">
                Inseam (cm)
              </label>
              <input
                type="text"
                id="inseam"
                name="inseam"
                value={measurements.inseam}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 80"
              />
            </div>
          </div>
        </div>
        
        {/* Personal Details Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-1">
                Timeline (days)
              </label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="deliveryMethod" className="block text-sm font-medium text-gray-300 mb-1">
                Delivery Method
              </label>
              <div className="flex space-x-4">
                {deliveryMethods.map((method) => (
                  <label key={method.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method.id}
                      checked={formData.deliveryMethod === method.id}
                      onChange={handleFormChange}
                      className="text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                    />
                    <span className="text-sm text-gray-300">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                Delivery Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your delivery address"
              />
            </div>
          </div>
        </div>
        
        {/* Payment Method Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Payment Method</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex space-x-4">
              {paymentMethods.map((method) => (
                <label key={method.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleFormChange}
                    className="text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                  />
                  <span className="text-sm text-gray-300">{method.label}</span>
                </label>
              ))}
            </div>
            
            <Button 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center gap-2 py-3"
              onClick={handlePaymentClick}
            >
              <span>Proceed to Payment</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
} 