import { Checkbox, ErrorBlock, NavBar, Space, Tag } from "antd-mobile";
import { useQuery } from "react-query";
          // @ts-ignore 
import { useHistory } from "react-router-dom";
import { storage } from "../utils";


const fetchCategories = async () => {
    const Link = storage.getUrl();
    const getToken = storage.getToken();
    const response = await fetch(`https://${Link}/wp-json/wc/v3/products/categories?per_page=100&` + new URLSearchParams(getToken))

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}

function AddCatProduct() {
    const history = useHistory();
    const { data, error, isLoading, isError } = useQuery(
        ['categories'],
        fetchCategories
    )

    const back = () =>
        history.goBack();
    return (
        <>
            <NavBar onBack={back}>Категории Продукта</NavBar>
            {isLoading && <ErrorBlock fullPage />}
            <Space direction='vertical'>

                {data && (
                    data.map((category: any) => (
                        <Checkbox value={category.id}>{category.name}</Checkbox>
                    ))
                )}
            </Space>

        </>
    )
}

export default AddCatProduct