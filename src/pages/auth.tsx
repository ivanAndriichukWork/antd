import { Form, Dialog, Input, Button, Toast } from "antd-mobile";
import { useAuth } from "../lib/auth";
import { useHistory } from "react-router";
export const Auth = () => {
    const history = useHistory();
    const { login } = useAuth();
    const sendForm = async (values: any) => {
        try {
            Toast.show({
                content: 'Проверка данных',
                maskClickable: false,
            });
            let Userlogin = await login(values);
            if (Userlogin) {
                history.push('/products');
            }
        } catch (err) {
            Dialog.show({
                // @ts-ignore
                content: err.message,
                title: 'Внимание',
                closeOnAction: true,
                actions: [{ key: 'online', text: 'Ок' }]
            })
        }

    }
    return (
        <Form
            name="auth"
            footer={
                <Button block type='submit' color='primary'>Войти</Button>
            }
            onFinish={sendForm}
        >
            <Form.Item
                name='phone'
                label='Телефон'
                rules={[{ required: true, 'message': 'is required' }]}
            >
                <Input placeholder='Введите телефон' />
            </Form.Item>
            <Form.Item
                name='password'
                label='Пароль'
                rules={[{ required: true, 'message': 'is required' }]}
            >
                <Input placeholder='Введите пароль' type='password' />
            </Form.Item>
        </Form>
    )
}