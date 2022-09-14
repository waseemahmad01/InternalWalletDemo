import {useState, useEffect} from 'react';
import 'react-native-get-random-values';
import {ethers} from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  ActivityIndicator,
} from 'react-native';

const App = () => {
  const [wallet, setWallet] = useState('');
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState(0);
  const [eth, setEth] = useState('');
  const [reciever, setReceiver] = useState('');

  const [loading, setLoading] = useState(false);

  const handleGenerateWallet = async () => {
    try {
      setLoading(true);
      let _signer = ethers.Wallet.createRandom();
      const provider = new ethers.providers.JsonRpcProvider(
        'https://rinkeby.infura.io/v3/e86883f6cc1046b689f30cebdf09c5aa',
      );
      _signer = new ethers.Wallet(_signer.privateKey, provider);
      await AsyncStorage.setItem('Public_key', _signer.address);
      await AsyncStorage.setItem('Private_key', _signer.privateKey);
      setWallet(_signer.address);
      setSigner(_signer);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckWallet = async () => {
    try {
      const publicKey = await AsyncStorage.getItem('Public_key');
      const privateKey = await AsyncStorage.getItem('Private_key');

      if (publicKey && privateKey) {
        setWallet(publicKey);
        const provider = new ethers.providers.JsonRpcProvider(
          'https://rinkeby.infura.io/v3/e86883f6cc1046b689f30cebdf09c5aa',
        );
        const _signer = new ethers.Wallet(privateKey, provider);

        setSigner(_signer);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const truncateString = val => {
    if (val) {
      const first = val.slice(0, 4);
      const last = val.slice(val.length - 4, val.length);
      return `${first}...${last}`;
    }
    return '';
  };

  const handleTransferEth = async () => {
    try {
      setLoading(true);
      let tx = {
        to: reciever,
        value: ethers.utils.parseEther(eth),
      };
      const transaction = await signer.sendTransaction(tx);
      await transaction.wait(1);
      await getBalance();
      setReceiver('');
      setEth('');
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getBalance = async () => {
    const balance = await signer.getBalance();
    setBalance(ethers.utils.formatEther(balance.toString()));
  };

  useEffect(() => {
    handleCheckWallet();
  }, []);

  useEffect(() => {
    if (signer) {
      getBalance();
    }
  }, [signer]);

  return (
    <View style={styles.app}>
      <View style={{padding: 20, width: '100%'}}>
        {wallet ? (
          <View
            style={{
              alignItems: 'center',
            }}>
            <Text style={styles.title}>Wallet info</Text>
            <TouchableHighlight
              onPress={() => Clipboard.setString(wallet)}
              onLongPress={() => getBalance()}
              style={styles.walletAddress}>
              <Text style={styles.walletAddressContent}>
                {truncateString(wallet)}
              </Text>
            </TouchableHighlight>

            <Text style={styles.balance}>{Number(balance).toFixed(4)} ETH</Text>
            <View style={{width: '100%'}}>
              <Text style={{fontSize: 20, marginTop: 30, color: 'purple'}}>
                Send Eth
              </Text>
            </View>
            <View style={{width: '100%'}}>
              <TextInput
                placeholder="Reciever address"
                style={styles.input}
                value={reciever}
                onChangeText={setReceiver}
              />
              <TextInput
                placeholder="Eth amount"
                keyboardType="decimal-pad"
                style={styles.input}
                value={eth}
                onChangeText={setEth}
              />
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="purple"
                  style={{marginTop: 20}}
                />
              ) : (
                <TouchableHighlight
                  onPress={handleTransferEth}
                  style={{
                    ...styles.button,
                    marginTop: 20,
                    height: 50,
                    borderRadius: 12,
                  }}>
                  <Text style={styles.buttonText}> send</Text>
                </TouchableHighlight>
              )}
            </View>
          </View>
        ) : (
          <>
            {loading ? (
              <ActivityIndicator size="large" color="purple" />
            ) : (
              <TouchableHighlight
                style={styles.button}
                onPress={handleGenerateWallet}>
                <Text style={styles.buttonText}>Generate Wallet</Text>
              </TouchableHighlight>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  app: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: 'purple',
    borderRadius: 40 / 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  title: {
    fontSize: 25,
    fontWeight: '500',
    color: 'purple',
    textAlign: 'center',
    marginBottom: 20,
  },
  walletAddress: {
    backgroundColor: '#80008066',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  walletAddressContent: {
    color: '#ffffff',
    fontSize: 18,
  },

  balance: {
    textAlign: 'center',
    fontSize: 32,
    color: 'purple',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#e7e7e7',
    width: '100%',
    height: 50,
    paddingHorizontal: 12,
    color: '#5c5c5c',
    borderRadius: 12,
    marginTop: 20,
  },
});
