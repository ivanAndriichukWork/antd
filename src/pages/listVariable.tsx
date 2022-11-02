import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { storage } from "../utils";
import { useMutation, useQuery } from "react-query";
import { List, Image, NavBar, Space, Search } from "antd-mobile";
import React from "react";
import { DeleteOutline, SearchOutline } from "antd-mobile-icons";


function ListVariable() {
  const { id } = useParams<{ id?: string }>();
  const [variable, setVariable] = useState([]);
  const history = useHistory();

  const fetchProductVariable = async () => {
    const Link = storage.getUrl();
    const getToken = storage.getToken();
    const response = await fetch(`https://${Link}/wp-json/wc/v3/products/${id}/variations?per_page=100&` + new URLSearchParams(getToken))
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }
  const fetchProductVariableDelete = async (variable_id: string, keyList: string) => {
    const Link = storage.getUrl();
    const getToken = storage.getToken();
    const response = await fetch(`https://${Link}/wp-json/wc/v3/products/${id}/variations/${variable_id}?&` + new URLSearchParams(getToken), { method: "DELETE" })
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    history.goBack();
  }
  const { data: data, error: errorVariable, isLoading: isLoadingVariable, isError: isErrorVariable, status } = useQuery(
    ['productVariable', { id }],
    fetchProductVariable, {
    onSuccess: ((data) => setVariable(data))
  }
  )
  let productList
  const right = (
    <div style={{ fontSize: 18 }}>
      <Space>
        <SearchOutline />
      </Space>
    </div>
  )

  const back = () =>
    history.goBack();
  productList = <>Еще нет Вариаций</>
  if (data.length > 0) {
    productList = data.map((product: any, index: any) => (
      <React.Fragment key={index}>
        <List.Item key={product.ID} description={product.price}
          prefix={
            <Image
              src={product.image ? product.image?.src : '/404'}
              width={100}
              height={100}
              fit='contain'
              style={{ borderRadius: 8 }}
            />}

          extra={<DeleteOutline color="red" onClick={() => fetchProductVariableDelete(product.id, index)} />}
        >
          {product.name}
        </List.Item>


      </React.Fragment>
    ))
  }
  return (
    <>
      <NavBar onBack={back} right={right}  >
        Вариации
      </NavBar>

      {status === 'success' && <List>{productList}</List>}
    </>
  )
}
export default ListVariable;