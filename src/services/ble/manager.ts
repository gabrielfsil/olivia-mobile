import { BleManager } from "react-native-ble-plx";

class BluetoothManager {
  private bleManager: BleManager;

  constructor() {
    this.bleManager = new BleManager();
  }

  getBleManager() {
    return this.bleManager;
  }
}

const bluetoothManager = new BluetoothManager();
export default bluetoothManager;
