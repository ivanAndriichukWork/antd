import axios from "axios";
import React, { FC, useState } from 'react'
import { useQuery, useMutation } from "react-query";
// @ts-ignore 
import { useParams, useHistory, Redirect } from "react-router-dom";
import { storage } from "../utils";
import Compressor from 'compressorjs';
import { Input, ImageUploader, Form, Button, Toast, NavBar, Empty, Space, Tag, Image, Dialog, Mask, Loading } from 'antd-mobile'
const initialProductState = {
    id: null,
    name: "",
    categories: [],
    description: "",
    regular_price: 0,
    sale_price: "",
    permalink: "#",
    sku: "",
    stock_status: "instock",
    images: [],
    img: "https://krasiva.com.ua/wp-content/uploads/2021/07/addf.png",
    published: false
};

const fetchProduct = async ({ queryKey }: any) => {
    const Link = storage.getUrl();
    const getToken = storage.getToken();
    const [_key, { id }] = queryKey
    const response = await fetch(`https://${Link}/wp-json/wc/v3/products/${id}?` + new URLSearchParams(getToken))

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}
// @ts-ignore
const updatePhoto = (id, data) => {
    Toast.show({
        icon: 'loading',
        content: 'Фото загружается',
    })
    const Link = storage.getUrl();
    const getToken = storage.getToken();
    const response = axios.post(`https://${Link}/wp-json/wa/v3/products/update_image/${id}?` + new URLSearchParams(getToken), data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(response);
}
function EditProduct() {
    const productImage = {
        image_name: "",
        image_type: "",
        image: "",
    }
    const [currentProductImage, setCurrentProductImage] = useState(productImage);
    const [currentProduct, setCurrentProduct] = useState(initialProductState);
    const history = useHistory();
    // @ts-ignore
    const [fileOne, setFileOne] = useState<FileItem[]>([])
    // @ts-ignore
    const [fileList, setFileList] = useState<FileItem[]>([])
    const [imgUrl, setImgUrl] = useState("404")
    const Link = storage.getUrl();
    const { id }: any = useParams()


    const { data, error, isLoading, isError } = useQuery(
        ['product', { id }],
        fetchProduct
    )
    console.log(data);
    React.useEffect(() => {
        // do some checking here to ensure data exist
        if (data && data.images[0]) {
            // mutate data if you need to
            console.log(fileOne[0]?.url);
            if (fileOne[0]?.url) {
                setFileOne([{
                    url: fileOne[0]?.url,
                }])
            setImgUrl(fileOne[0]?.url);

            }else{
            setImgUrl(data.images[0]?.src);

                setFileOne([{
                    url: data.images[0]?.src,
                }])
            }

                 setCurrentProduct(data);
                console.log(currentProduct);
        }
    }, [data])
    function blobToBase64(blob: any) {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    const compreseImage = (file: any) => {
        console.log(file);
        new Compressor(file, {
            quality: 0.5,
            convertSize: 2000000,
            success(result: any) {
                // @ts-ignore
                blobToBase64(result).then(e => setCurrentProductImage({ ...currentProductImage, image: e, image_name: result.name, image_type: (result.type).split("/")[1] }));

            }
        })
    }
    const compreseImages = (file: any) => {
        new Compressor(file, {
            quality: 0.5,
            success(result) {
                console.log(result);
            }
        })
    }
    const mutation = useMutation((updateProduct) => {
        const getToken = storage.getToken();
        return axios.put(`https://${Link}/wp-json/wc/v3/products/${id}?` + new URLSearchParams(getToken), updateProduct)
    })

    const { isSuccess } = mutation
    const onSubmit = async (data: any) => {
        console.log(data);
        Toast.show({
            icon: 'loading',
            content: 'Идет Обновление данных',
        })
        mutation.mutate(data)
    }
    if (isSuccess) {
        return <Redirect to="/products" />
    }
    const back = () =>
        history.goBack();


    async function mockUpload(file: File) {
        compreseImages(file);
        return {
            url: URL.createObjectURL(file),
        }
    }
    async function mockUploadOne(file: File) {
        console.log(file);
        compreseImage(file);
        setImgUrl(URL.createObjectURL(file));

        return {
            url: URL.createObjectURL(file),
        }
    }

    return (
        <div>

            <NavBar onBack={back}>Редактировать Продукт</NavBar>
            {isLoading && <Empty description='Загружаются данніе' />}
            
            {data && (
                console.log(data),
                <>
                    {imgUrl !== "404" && <Image height={"250px"} fit='contain' width={"100%"} src={imgUrl} />}
                    {imgUrl === "404" && <Image height={"250px"} fit='cover' width={"100%"} src={"404"} />}
                    <ImageUploader
                        onDelete={() => setImgUrl("404")}
                        maxCount={1}
                        value={fileOne}
                        onChange={setFileOne}
                        upload={mockUploadOne}
                    />
                    <Button
                        onClick={() => {
                            updatePhoto(data.id, currentProductImage);
                        }}
                    >
                        Загрузить основное фото
                    </Button>
                    <ImageUploader
                        maxCount={3}
                        value={fileList}
                        onChange={setFileList}
                        upload={mockUpload}
                    />
                    <Form
                        onFinish={onSubmit}
                        footer={
                            <Button block type='submit' color='primary'>
                                Сохранить
                            </Button>
                        }
                        initialValues={{
                            name: data.name,
                            regular_price: data.regular_price,
                        }}
                    >
                        <Form.Item
                            name='name'
                            label='Наименование'
                            rules={[{ required: true, message: 'Не может біть пустім' }]}
                        >
                            <Input defaultValue={data.name} value={data.name} placeholder='Название' />
                        </Form.Item>
                        <Form.Item
                            name='price'
                            label='Цена'
                            rules={[{ required: true, message: 'Не может быть пустым' }]}
                        >
                            <Input type={"number"} defaultValue={data.price} value={data.price}   placeholder='Цена' />
                        </Form.Item>
                        <Form.Item
                            onClick={() => history.push(`/products/${data.id}/categories`)}
                            label='Категории'
                        >
                            <Space wrap>
                                {data.categories.map((category: any) => (
                                    <Tag color='primary'>{category.name}</Tag>
                                ))}
                            </Space>
                        </Form.Item>
                    </Form>
                </>
            )}
        </div>
    )
}

export default EditProduct