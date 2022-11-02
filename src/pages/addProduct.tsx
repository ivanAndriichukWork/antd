import { Button, Form, Input, NavBar, TreeSelect } from "antd-mobile";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { storage } from "../utils";
import { findIndex } from "lodash";
function AddProduct() {
    const [categories, setCategories] = useState([]);
    const [TestCategories, setTestCategories] = useState([]);
    const [children, setChildren] = useState({});
    const fetchCategory = async () => {
        const Link = storage.getUrl();
        const getToken = storage.getToken();
        const response = await fetch(`https://${Link}/wp-json/wc/v3/products/categories?parent=0&` + new URLSearchParams(getToken))
        console.log(response)
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return await response.json();
    }
    const fetchChildernCat = async (id: string) => {
        const Link = storage.getUrl();
        const getToken = storage.getToken();
        const response = await fetch(`https://${Link}/wp-json/wc/v3/products/categories/?parent=${id}&` + new URLSearchParams(getToken))

        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return await response.json();
    }
    const history = useHistory();

    useEffect(() => {
        fetchCategory().then(e => { setCategories(e); setTestCategories(e) });
    }, [])

    const back = () =>
        history.goBack();

    const onFinish = (e: any) => {
        console.log(e);
    }
    return (
        <>
            <NavBar onBack={back}>Редактировать Продукт</NavBar>
            <Form
                onFinish={onFinish}
                footer={
                    <Button block type='submit' color='primary'>
                        Сохраанить
                    </Button>
                }
            >

                <Form.Item
                    name='name'
                    label='Имя'
                    rules={[{ required: true, message: 'Обезательно' }]}
                >
                    <Input placeholder='Название товара' />
                </Form.Item>
                <Form.Item
                    name='price'
                >
                    <Input placeholder='Цена' clearable type="number" />
                </Form.Item>
                <Form.Item
                    name='category'
                >
                    <TreeSelect
                        options={categories}
                        fieldNames={{ label: "name", value: "id", children: "children" }}
                        onChange={(value, nodes) => {
                            fetchChildernCat(value[0]).then(e => { console.log(e); setChildren(e) });
                            let id = nodes.options[0].id;
                            // @ts-ignore 

                            let finIndexKey = findIndex(categories, function (o) { return o.id == id; });
                            
                            nodes.options[0].children = children;
                            if (children) {
                                // @ts-ignore 

                                TestCategories[finIndexKey].child =
                                setTestCategories({ ...TestCategories, ...nodes.options[0] });
                                console.log(TestCategories);
                            }
                        }}
                    />
                </Form.Item>
            </Form>
        </>
    )
}
export default AddProduct;
