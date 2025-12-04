Aplikasi ini mengakses tabel uploadfile yang berelasi dengan tabel store di mana uploadfile.store_id = store.storeid.
Di dalam uploadfile ada kolom uploaded_filename yang merujuk ke file yang tersimpan di Google Cloud Storage.
Project untuk Google Cloud Storage ini adalah telkomsel-retail-intelligence dan bucketnya "retail-intelligence-bucket".

Aplikasi ini menampilkan data uploadfile tersebut, beserta gambarnya (thumbnail). Data yang diambil adalah uploadfile.id as ID, uploadfile.uploaded_by_sfcode AS UPLOADER_SFCODE, uploafile.uploaded_by_email as UPLOADER_EMAIL, uploadfile.createdAt, store.store_name AS OUTLET_NAME, store.store_city AS OUTLET CITY, store.store_region AS OUTLET_REGION, store.store_area AS OUTLET_AREA.
Thumbnail itu bisa diclick untuk dilihat lebih besar menggunakan popup, dan didownload.
Di halaman daftar uploadfile ini, ada filter range tanggal. Aplikasi hanya menampilkan data berdasarkan tanggal tersebut dilihat di kolom "createdAt".
Di halaman ini juga terdapat filter AREA, REGION, dan CITY. Master data AREA, REGION dan CITY ada di table cityregionarea.
Di halaman ini juga ada filter Kategory Image. Dia berhubungan dengan kolom "imageCategory" di uploadfile. Ada 3 jenis imageCategory: poster, etalase, storefront.

Di halaman ini juga ada button untuk Download daftar uploadfile tersebut. Hasil download adalah sebuah file excel berisi informasi daftar tersebut beserta file-file yang dirujuk oleh kolom uploaded_filename. Semua file-file tersebut dikelompokkan menjadi folder-folder yang strukturnya berdasarkan AREA -> REGION -> CITY. Semiua file ini dizip menjadi satu file zip.

Buat taampilan aplikasi dengan background putih dan kombinasi warna logo telkomsel. Nama aplikasinya adalah Retina Downloader.

Aplikasi ini akan berjalan di Cloud Run GCP.