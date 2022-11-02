import axios from "axios";
import React, { useState } from 'react'
import { useQuery, useMutation } from "react-query";
import { useParams } from 'react-router-dom';
import { storage } from "../utils";
import { Link } from 'react-router-dom'
import Compressor from 'compressorjs';
import { Toast, NavBar, Empty, Image, SwipeAction, List } from 'antd-mobile'
import { Action } from 'antd-mobile/es/components/swipe-action'
import { useHistory } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { AddSquareOutline } from "antd-mobile-icons";

const initialProductState = {
    id: null,
    name: "",
    categories: [],
    description: "",
    regular_price: "",
    sale_price: "",
    permalink: "#",
    sku: "",
    stock_status: "instock",
    images: [],
    img: "https://krasiva.com.ua/wp-content/uploads/2021/07/addf.png",
    published: false
};

const fetchProducts = async ({ queryKey }: any) => {
    const Link = storage.getUrl();
    const getToken = storage.getToken();
    const [_key, { search }] = queryKey
    const response = await fetch(`https://${Link}/wp-json/wc/v3/products/?search=${search}&` + new URLSearchParams(getToken))

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
function SearchQuery() {
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
    const { search }: any = useParams()


    const { data, status, error, isLoading, isError } = useQuery(
        ['SearchProducts', { search }],
        fetchProducts
    )

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
        return axios.put(`https://${Link}/wp-json/wc/v3/products/?s=${search}&` + new URLSearchParams(getToken), updateProduct)
    })
    const rightActions: Action[] = [
        {
            key: 'unsubscribe',
            text: 'в наличии',
            color: 'success',
        },
        {
            key: 'mute',
            text: 'нет в наличии',
            color: 'warning',
        },
        {
            key: 'delete',
            text: 'удалить',
            color: 'danger',
        },
    ]
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
    let productList
    const linkCreateVariable = (id: string) => {
        history.push("/variable/" + id);
    }
    if (data) {
        console.log(data);
        productList = data.map((product: any, index: string) => (
            <React.Fragment key={index}>
                <SwipeAction
                    key={product.ID}
                    rightActions={rightActions}
                >

                    <List.Item key={product.ID} description={product.price}
                        prefix={<Image
                            src={product.images ? product.images[0]?.src : '/404'}
                            width={100}
                            height={100}
                            fit='contain'
                            style={{ borderRadius: 8 }}
                        />}
                        extra={<AddSquareOutline onClick={() => linkCreateVariable(product.id)} />}

                    >
                        <Link
                            to={`/products/${product.id}`}
                        >
                            {product.name}
                        </Link>

                    </List.Item>
                </SwipeAction>
            </React.Fragment>
        ))
    }
    console.log(status);
    return (
        <div>

            <NavBar onBack={back}>Найденые продукты</NavBar>
            {isLoading && <Empty description='Загружаются данніе' />}
            {status === 'success' && <List>{productList}</List>}
        </div>
    )
}

export default SearchQuery