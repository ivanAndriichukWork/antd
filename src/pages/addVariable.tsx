import { Button, Form, Image, ImageUploader, Input, NavBar, Toast } from "antd-mobile";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useHistory, useParams } from "react-router-dom";
import Compressor from 'compressorjs';
import { storage } from "../utils";
import axios from "axios";
import { isEmpty, parseInt } from "lodash";

function AddVariable() {
    const [attr, setAttr] = useState();
    const [variable, setVariable] = useState([]);
    const [cauntVariable, setCauntVariable] = useState(0);
    const [productSimple, setProductSimple] = useState();
    const history = useHistory();
    const productImage = {
        image_name: "",
        image_type: "",
        image: "",
    }
    const [form] = Form.useForm();
    const fetchProduct = async () => {
        const Link = storage.getUrl();
        const getToken = storage.getToken();
        const response = await fetch(`https://${Link}/wp-json/wc/v3/products/${id}?` + new URLSearchParams(getToken))
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.json();
    }
    const fetchProductVariable = async () => {
        const Link = storage.getUrl();
        const getToken = storage.getToken();
        const response = await fetch(`https://${Link}/wp-json/wc/v3/products/${id}/variations?` + new URLSearchParams(getToken))
                // @ts-ignore
        setCauntVariable(response?.headers?.get("x-wp-total"));
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.json();
    }
    const fetchProductAttrData = async () => {
        const Link = storage.getUrl();
        const getToken = storage.getToken();
        const response = await fetch(`https://${Link}/wp-json/wc/v3/products/attributes/3/terms?` + new URLSearchParams(getToken))
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.json();
    }
    const fetchProductAttr = async () => {
        const Link = storage.getUrl();
        const getToken = storage.getToken();
        const response = await fetch(`https://${Link}/wp-json/wc/v3/products/attributes?` + new URLSearchParams(getToken))
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.json();
    }
    const { id } = useParams<{ id?: string }>();
    // @ts-ignore
    const [currentProductImage, setCurrentProductImage] = useState(productImage);
    // @ts-ignore
    const [fileOne, setFileOne] = useState<FileItem[]>([])
    const [imgUrl, setImgUrl] = useState("404")
    const linkCreateVariable = (id: any) => {
        history.push("/variable/" + id + "/list");
    }
    const Link = storage.getUrl();

    const { data: dataVariable, error: errorVariable, isLoading: isLoadingVariable, isError: isErrorVariable } = useQuery(
        ['productVariable', { id }],
        fetchProductVariable, {
        onSuccess: ((data) => setVariable(data))
    }
    )

    const { data, error, isLoading, isSuccess, isError } = useQuery(
        ['productData', { id }],
        fetchProduct, {
        onSuccess: ((data) => setProductSimple(data))
    }
    )



    const { data: dataAttr, error: errorAttr, isLoading: isLoadingAttr, isError: isErrorAttr } = useQuery(
        ['productVariableAttr'],
        fetchProductAttr
    )

    const { data: ProductdataAttr, error: ProducterrorAttr, isLoading: ProductisLoadingAttr, isError: ProductisErrorAttr } = useQuery(
        ['productAttrData'],
        fetchProductAttrData
    )
    // @ts-ignore
    const updatePhoto = (id, data) => {
        if (data) {

            const Link = storage.getUrl();
            const getToken = storage.getToken();
            const response = axios.post(`https://${Link}/wp-json/wa/v3/products/update_image/${id}?` + new URLSearchParams(getToken), data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(response);
        }
    }
    const mutation = useMutation((updateProduct) => {
        Toast.show({
            duration: 4000,
            icon: 'loading',
            content: 'Создается вариация',
        })
        const getToken = storage.getToken();
                // @ts-ignore
   
        let leng = parseInt(cauntVariable) + 1;
        let arrayNumbers = Array.from({ length: leng }, (_, i) => (i + 1).toString());
        let addCharter = { "name": leng.toString() };
        return axios.post(`https://${Link}/wp-json/wc/v3/products/attributes/3/terms?` + new URLSearchParams(getToken), addCharter).then(() => {
            axios.put(`https://${Link}/wp-json/wc/v3/products/${id}?` + new URLSearchParams(getToken), { "type": "variable", "attributes": [{ "name": "Characteristic", "variation": true, "visible": true, "options": arrayNumbers }] }).then(() => {
                // @ts-ignore

                axios.post(`https://${Link}/wp-json/wc/v3/products/${id}/variations?` + new URLSearchParams(getToken), updateProduct).then(product => { console.log(product), updatePhoto(product?.data?.id, currentProductImage) })
            })
        }).catch(() => {
            axios.put(`https://${Link}/wp-json/wc/v3/products/${id}?` + new URLSearchParams(getToken), { "type": "variable", "attributes": [{ "name": "Characteristic", "variation": true, "visible": true, "options": arrayNumbers }] }).then(() => {
                // @ts-ignore

                axios.post(`https://${Link}/wp-json/wc/v3/products/${id}/variations?` + new URLSearchParams(getToken), updateProduct).then(product => { console.log(product), updatePhoto(product?.data?.id, currentProductImage) })
            })
        });


    })
    const compreseImage = (file: any) => {
        new Compressor(file, {
            quality: 0.5,
            convertSize: 2000000,
            success(result: any) {
                // @ts-ignore
                blobToBase64(result).then(e => setCurrentProductImage({ ...currentProductImage, image: e, image_name: result.name, image_type: (result.type).split("/")[1] }));

            }
        })
    }
    function blobToBase64(blob: any) {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }
    async function mockUploadOne(file: File) {
        compreseImage(file);
        setImgUrl(URL.createObjectURL(file));

        return {
            url: URL.createObjectURL(file),
        }
    }

    const onSubmit = async (data: any) => {
        mutation.mutate(data)
    }

    let inputName;
    let regular_price;
    let num = 1;
    if (!isLoading) {
                // @ts-ignore

        inputName = productSimple?.name;
                // @ts-ignore

        regular_price = productSimple?.price;
        form.setFieldsValue({ name: inputName, regular_price: regular_price });


    }
    if (!isLoadingVariable && productSimple) {
                // @ts-ignore

        inputName = productSimple?.name;
                // @ts-ignore

        let num = (parseInt(cauntVariable) + 1).toString();
        form.setFieldsValue({ name: inputName + ' ' + num });
        form.setFieldsValue({ "attributes": [{ "option": num, "name": "Characteristic" }] });

    }
    const back = () =>
        history.goBack();

    return (
        <>
            <NavBar onBack={back}  >
              Создать  Вариацию
            </NavBar>
            <Image style={{ margin: "0 auto", display: "block" }} src={imgUrl} width={250} height={250} fit='fill' />
            <ImageUploader
                maxCount={1}
                onChange={setFileOne}
                value={fileOne}
                upload={mockUploadOne}

            />
            <Form
                form={form}
                onFinish={onSubmit}
                footer={
                    <Button block type='submit' color='primary'>
                        Сохранить
                    </Button>
                }
            >
                <Form.Item
                    name={["attributes", 0, "name"]}
                    initialValue="Characteristic"
                    hidden={true}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name={["attributes", 0, "option"]}
                    initialValue={(num).toString()}
                    hidden={true}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="description"
                >
                    <Input placeholder={"Имя товара, по желанию"} />
                </Form.Item>
                <Form.Item
                    help="Если не указать цену будет, взята с основного товара"
                    name="regular_price"
                >
                    <Input placeholder={"Цена товара, по желанию"} />
                </Form.Item>
            </Form>
            <Button onClick={() => linkCreateVariable(id)}>Список Вариаций</Button>
        </>
    )
}
export default AddVariable;