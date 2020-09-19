import React, { Component } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Keyboard
} from 'react-native';



export default class test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            a: '',
            b: '',
            c: '',
            d: '',
            e: '',
            f: '',
            otp: this.props.otp,
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ otp: nextProps.otp })
    }

    async onChangeText(key, value) {
        const { a, b, c, d, e, f, otp } = this.state;
        if (key == 'a') {
            this.setState({ a: value });
            if (value)
                this.b.focus();
        }
        else if (key == 'b') {
            this.setState({ b: value });
            if (value)
                this.c.focus();
        }
        else if (key == 'c') {
            this.setState({ c: value });
            if (value)
                this.d.focus();
        }
        else if (key == 'd') {
            this.setState({ d: value });
            if (value) {
                this.e.focus();
            }
        }
        else if (key == 'e') {
            this.setState({ e: value });
            if (value) {
                this.f.focus();
            }
        }
        else if (key == 'f') {
            await this.setState({ f: value });
            if (value) {
                Keyboard.dismiss();
                const otp = a + b + c + d + e + value;
                this.varifiedOTP(otp);
            }
        }
    }

    backSpace(key) {
        const { a, b, c, d, e, f, otp } = this.state;
        if (key == 'a') {
            this.a.focus();
        }
        else if (key == 'b') {
            this.a.focus();
        }
        else if (key == 'c') {
            this.b.focus();
        }
        else if (key == 'd') {
            this.c.focus();
        }
        else if (key == 'e') {
            this.d.focus();
        }
        else if (key == 'f') {
            this.e.focus();
        }
    }

    onFocus(key) {
        const { a, b, c, d, e, f, otp } = this.state;

        if (key == 'a') {
            this.setState({ a: '', b: '', c: '', d: '', e: '', f: '' })
            this.a.focus();
        }
        else if (key == 'b') {
            this.setState({ b: '', c: '', d: '', e: '', f: '' })
            this.b.focus();
        }
        else if (key == 'c') {
            this.setState({ c: '', d: '', e: '', f: '' })
            this.c.focus();
        }
        else if (key == 'd') {
            this.setState({ d: '', e: '', f: '' })
            this.d.focus();
        }
        else if (key == 'e') {
            this.setState({ e: '', f: '' })
            this.e.focus();
        }
        else if (key == 'f') {
            this.setState({ f: '' })
            this.f.focus(otp);
        }
    }

    varifiedOTP(otp) {

        console.log("for latst char " ,otp, this.state.otp)
        this.props.code(otp);
        if (otp) {
            this.props.status('200');
            return true;
        }
        else {
            this.props.status('300');
            return false;
        }
    }

    render() {

        const { a, b, c, d, e, f, otp } = this.state;

        return (
            <View style={{ alignItems: 'center' }}>

                <View style={styles.textInputView}>
                    <TextInput
                        textContentType='oneTimeCode'
                        ref={(input) => { this.a = input; }}
                        style={[styles.textInput, { borderRightWidth: 1.5 }]}
                        value={a}
                        keyboardType='number-pad'
                        placeholder=""
                        maxLength={1}
                        onChangeText={(a) => this.onChangeText('a', a)}
                        onKeyPress={({ nativeEvent }) => {
                            nativeEvent.key === 'Backspace' ? this.backSpace('a') : console.log('other action')
                        }}
                        onFocus={() => { this.onFocus('a'); }}
                    />
                    <TextInput
                        textContentType='oneTimeCode'
                        ref={(input) => { this.b = input; }}
                        style={[styles.textInput, { borderRightWidth: 1.5 }]}
                        value={b}
                        keyboardType='number-pad'
                        placeholder=""
                        maxLength={1}
                        onChangeText={(b) => this.onChangeText('b', b)}
                        onKeyPress={({ nativeEvent }) => {
                            nativeEvent.key === 'Backspace' ? this.backSpace('b') : console.log('other action')
                        }}
                        onFocus={() => { a == '' ? this.onFocus('a') : this.onFocus('b') }}
                    />
                    <TextInput
                        textContentType='oneTimeCode'
                        ref={(input) => { this.c = input; }}
                        style={[styles.textInput, { borderRightWidth: 1.5 }]}
                        value={c}
                        keyboardType='number-pad'
                        placeholder=""
                        maxLength={1}
                        onChangeText={(c) => this.onChangeText('c', c)}
                        onKeyPress={({ nativeEvent }) => {
                            nativeEvent.key === 'Backspace' ? this.backSpace('c') : console.log('other action')
                        }}
                        onFocus={() => { b == '' ? this.onFocus('b') : this.onFocus('c') }}
                    />
                    <TextInput
                        textContentType='oneTimeCode'
                        ref={(input) => { this.d = input; }}
                        style={[styles.textInput, { borderRightWidth: 1.5 }]}
                        value={d}
                        keyboardType='number-pad'
                        placeholder=""
                        maxLength={1}
                        onChangeText={(d) => this.onChangeText('d', d)}
                        onKeyPress={({ nativeEvent }) => {
                            nativeEvent.key === 'Backspace' ? this.backSpace('d') : console.log('other action')
                        }}
                        onFocus={() => { c == '' ? this.onFocus('c') : this.onFocus('d') }}
                    />

                    <TextInput
                        textContentType='oneTimeCode'
                        ref={(input) => { this.e = input; }}
                        style={[styles.textInput, { borderRightWidth: 1.5 }]}
                        value={e}
                        keyboardType='number-pad'
                        placeholder=""
                        maxLength={1}
                        onChangeText={(e) => this.onChangeText('e', e)}
                        onKeyPress={({ nativeEvent }) => {
                            nativeEvent.key === 'Backspace' ? this.backSpace('e') : console.log('other action')
                        }}
                        onFocus={() => { d == '' ? this.onFocus('d') : this.onFocus('e') }}
                    />
                    <TextInput
                        textContentType='oneTimeCode'
                        ref={(input) => { this.f = input; }}
                        style={[styles.textInput, { borderRightWidth: 1.5 }]}
                        value={f}
                        keyboardType='number-pad'
                        placeholder=""
                        maxLength={1}
                        onChangeText={(f) => this.onChangeText('f', f)}
                        onKeyPress={({ nativeEvent }) => {
                            nativeEvent.key === 'Backspace' ? this.backSpace('f') : console.log('other action')
                        }}
                        onFocus={() => { e == '' ? this.onFocus('e') : this.onFocus('f') }}
                    />
                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    textInputView: {
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 12
    },
    textInput: {
        padding: 0,
        fontSize: 25,
        textAlign: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderColor: '#e7e7e7',
    },
});