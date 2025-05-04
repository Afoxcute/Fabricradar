'use client';

import { useState } from 'react';
import { Formik, Form } from 'formik';
import { Button, Card, Col, Row, Table, Tag, Upload, message } from 'antd';
import { IoCloudUploadSharp } from 'react-icons/io5';
import * as Yup from 'yup';
import { Input } from '@/components/Input';
import { TextArea } from '@/components/TextArea';
import { SelectInput } from '@/components/SelectInput';
import Image from 'next/image';

const productSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().required('Price is required'),
  category: Yup.string().required('Category is required'),
  images: Yup.mixed().required('At least one image is required'),
});

const categories = [
  { value: 'shirts', label: 'Shirts' },
  { value: 'pants', label: 'Pants' },
  { value: 'jackets', label: 'Jackets' },
  { value: 'dresses', label: 'Dresses' },
];

const initialProducts = [
  {
    key: '1',
    name: 'Slim Fit Shirt',
    price: '₦8,000',
    category: 'Shirts',
    description: 'A stylish slim fit shirt for casual wear.',
    images: [],
    status: 'Available',
  },
  {
    key: '2',
    name: 'Denim Jacket',
    price: '₦15,000',
    category: 'Jackets',
    description: 'Warm and trendy denim jacket.',
    images: [],
    status: 'Out of Stock',
  },
];

const columns = [
  {
    title: 'Product Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === 'Available' ? 'green' : 'red'}>{status}</Tag>
    ),
  },
];

const Products = () => {
  const [products, setProducts] = useState(initialProducts);

  const handleAddProduct = (values: any) => {
    setProducts((prev) => [
      ...prev,
      {
        ...values,
        key: String(prev.length + 1),
        price: `₦${values.price}`,
        status: 'Available',
      },
    ]);
    message.success('Product added successfully!');
  };

  return (
    <div className="w-full min-h-screen px-6 py-6 bg-gray-950 text-white">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-400">Manage and add fashion products</p>
        </div>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card
            title="Total Products"
            className="bg-gray-900 border border-gray-800 text-white"
          >
            <p className="text-2xl font-bold">{products.length}</p>
          </Card>
        </Col>
      </Row>

      <Card
        title="Add New Product"
        className="bg-gray-900 border border-gray-800 text-white mb-6"
        headStyle={{ backgroundColor: '#111827', color: 'white' }}
        bodyStyle={{ backgroundColor: '#111827', color: 'white' }}
      >
        <Formik
          initialValues={{
            name: '',
            price: '',
            category: '',
            description: '',
            images: [],
          }}
          validationSchema={productSchema}
          onSubmit={(values, { resetForm }) => {
            handleAddProduct(values);
            resetForm();
          }}
        >
          {({ setFieldValue }) => (
            <Form className="grid grid-cols-2 gap-6">
              <Input name="name" label="Product Name" />
              <Input name="price" label="Price" type="number" />
              <SelectInput
                name="category"
                label="Category"
                options={categories}
              />
              <div className="col-span-2">
                <TextArea name="description" label="Description" />
              </div>
              <div className="col-span-2">
                <Upload
                  name="images"
                  listType="picture"
                  multiple
                  beforeUpload={() => false}
                  onChange={(info) => setFieldValue('images', info.fileList)}
                  //   showUploadList={{
                  //     // showRemoveIcon: true,
                  //     removeIcon: <span className="text-white"></span>,
                  //   }}

                  className="text-white"
                >
                  <Button icon={<IoCloudUploadSharp />}>Upload Images</Button>
                </Upload>
              </div>
              <div className="col-span-2 flex justify-end">
                <Button
                  htmlType="submit"
                  type="primary"
                  className="bg-blue-600"
                >
                  Add Product
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>

      <Card
        title="Product List"
        className="bg-gray-900 border border-gray-800 text-white"
        headStyle={{ backgroundColor: '#111827', color: 'white' }}
        bodyStyle={{ backgroundColor: '#111827', color: 'white' }}
      >
        <Table
          dataSource={products}
          columns={columns}
          pagination={false}
          rowClassName={() => 'bg-gray-900 hover:bg-gray-800 text-white'}
        />
      </Card>
    </div>
  );
};

export default Products;
