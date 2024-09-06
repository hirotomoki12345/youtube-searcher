
# PTube

**PTube** は、YouTube動画を検索し、簡単に動画の情報を取得することができるアプリケーションです。

## 使い方

### 1. Webで利用する

PTubeは私がホストしています。以下のリンクからすぐに利用可能です：

[PTube - YouTube検索](https://youtube.psannetwork.net)

### 2. 自宅でホストする

自宅でPTubeをホストするには、最初に**Node.jsの最新バージョン**をインストールし、その後**PM2**を使ってPTubeを自動で実行する必要があります。

#### Node.jsの最新バージョンをインストール

1. `nvm`（Node Version Manager）を使用することで、Node.jsの最新バージョンをインストールできます。  
   まず、以下のコマンドを実行して `nvm` をインストールします。

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
   ```

2. インストールが完了したら、次のコマンドで `nvm` を有効にします。

   ```bash
   source ~/.nvm/nvm.sh
   ```

3. 最新のNode.jsをインストールするには、以下のコマンドを実行します。

   ```bash
   nvm install node
   ```

4. Node.jsが正しくインストールされたか確認するために、次のコマンドでバージョンを確認します。

   ```bash
   node -v
   ```

#### サーバーの起動方法

1. ターミナルで以下のコマンドを実行し、セットアップスクリプトをダウンロードします。

   ```bash
   curl -Ls https://raw.githubusercontent.com/hirotomoki12345/youtube-searcher/main/set.sh -o set.sh
   ```

2. 次に、スクリプトを実行します。

   ```bash
   bash ./set.sh
   ```

3. メニューが表示されたら、「1」を押してサーバーを起動します。
