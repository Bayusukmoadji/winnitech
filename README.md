# WINNITECH

# GARUDA TECHNOLOGY

%% Flowchart untuk Proyek Winntech - V5 (Hapus 'direction' dari Subgraph)

graph TD
A["Pengguna Masuk ke Landing Page (index.html)"] --> B["Logo dan Tombol ENTER SITE"];
B -- "Klik 'ENTER SITE'" --> C_NEWS["Halaman News (news.html)"];

    %% Representasi Navbar yang Lebih Terpusat
    C_NEWS --> NAV["Akses Navbar"];
    E_TECHSTOCKS["Halaman TechStocks (techstocks.html)"] --> NAV;
    F_LAUNCHES["Halaman Launches (launches.html)"] --> NAV;
    J_DETAILLAUNCHES["Halaman DetailLaunches (detailLaunches.html)"] --> NAV;

    NAV -- "Pilih 'News'" --> C_NEWS;
    NAV -- "Pilih 'TechStocks'" --> E_TECHSTOCKS;
    NAV -- "Pilih 'Launches'" --> F_LAUNCHES;

    NAV -- "Gunakan Search Bar" --> SEARCH_ROUTER{Pencarian di Halaman Aktif};

    SEARCH_ROUTER -- "Konteks: News" --> NEWS_SEARCH_ACTION["JS: Pencarian Berita (API + Filter Judul)"];
    NEWS_SEARCH_ACTION --> C_NEWS_RESULT["Tampilkan Hasil Pencarian Berita di Grid"];
    %% Kembali ke konteks halaman News dengan hasil
    C_NEWS_RESULT --> C_NEWS;

    SEARCH_ROUTER -- "Konteks: TechStocks" --> TS_SEARCH_ACTION["JS: Filter Saham (Client-side pada data yang dimuat)"];
    TS_SEARCH_ACTION --> E_TECHSTOCKS_RESULT["Tampilkan Hasil Filter Saham di Grid"];
    %% Kembali ke konteks halaman TechStocks
    E_TECHSTOCKS_RESULT --> E_TECHSTOCKS;

    SEARCH_ROUTER -- "Konteks: Launches" --> L_SEARCH_ACTION["JS: Filter Peluncuran (Client-side pada data statis)"];
    L_SEARCH_ACTION --> F_LAUNCHES_RESULT["Tampilkan Hasil Filter Peluncuran di Grid"];
    %% Kembali ke konteks halaman Launches
    F_LAUNCHES_RESULT --> F_LAUNCHES;

    %% Search bar di DetailLaunches disembunyikan (tidak ada aksi search dari NAV di J_DETAILLAUNCHES)

    subgraph "Alur Halaman News"
        %% 'direction TD' dihapus dari sini
        C_NEWS --> C_LOAD["JS: Load Berita Awal (API)"];
        C_LOAD --> C_VIEW["Tampilkan Carousel & Grid Berita"];
        C_VIEW -- "Scroll/Lihat" --> C_VIEW;
        C_VIEW -- "Klik Artikel Berita" --> C_EXT["Buka Link Artikel Asli di TechCrunch (Tab Baru)"];
        C_VIEW -- "Klik 'Load More' (Berita Umum atau Hasil Search)" --> C_LOAD_MORE["JS: Load Batch Berita Berikutnya (Kontekstual)"];
        C_LOAD_MORE --> C_VIEW;
    end

    subgraph "Alur Halaman TechStocks"
        %% 'direction TD' dihapus dari sini
        E_TECHSTOCKS --> TS_LOAD_BATCH["JS: Load Batch Awal Saham (API Finnhub)"];
        TS_LOAD_BATCH --> TS_VIEW["Tampilkan Grid Kartu Saham"];
        TS_VIEW -- "Scroll/Lihat" --> TS_VIEW;
        TS_VIEW -- "Klik 'Load More Stocks'" --> TS_LOAD_MORE_BATCH["JS: Load Batch Saham Berikutnya"];
        TS_LOAD_MORE_BATCH --> TS_VIEW;
    end

    subgraph "Alur Halaman Launches"
        %% 'direction TD' dihapus dari sini
        F_LAUNCHES --> F_VIEW["Tampilkan Daftar Kartu Peluncuran (Statis)"];
        F_VIEW -- "Scroll/Lihat" --> F_VIEW;
        F_VIEW -- "Klik 'Read More'" --> J_DETAILLAUNCHES;
    end

    subgraph "Alur Halaman DetailLaunches"
        %% 'direction TD' dihapus dari sini
        J_DETAILLAUNCHES --> J_VIEW["Tampilkan Detail Produk"];
        J_VIEW -- "Klik 'Visit Official Site'" --> J_EXT["Buka Link Situs Resmi Produk (Tab Baru)"];
        J_VIEW -- "Klik 'Leave a Comment'" --> J_FORM_SHOW["Tampilkan Form Komentar Utama"];
        J_FORM_SHOW -- "Isi Form & Submit" --> J_SUBMIT_COMMENT["JS: (Konsep) Kirim ke Backend"];
        J_SUBMIT_COMMENT --> J_VIEW_COMMENTS["Tampilkan Komentar Baru"];
        J_FORM_SHOW -- "Klik 'Cancel'" --> J_VIEW;

        J_VIEW_COMMENTS -- "Klik 'Reply'" --> J_REPLY_FORM_SHOW["Tampilkan Form Balasan"];
        J_REPLY_FORM_SHOW -- "Isi Form Balasan & Submit" --> J_SUBMIT_REPLY["JS: (Konsep) Kirim Balasan ke Backend"];
        J_SUBMIT_REPLY --> J_VIEW_COMMENTS;
        J_REPLY_FORM_SHOW -- "Klik 'Cancel'" --> J_VIEW_COMMENTS;
    end

    subgraph "Alur Admin (CRUD Launches - Konseptual)"
        %% 'direction TD' dihapus dari sini
        ADMIN_START["Admin"] --> ADMIN_LOGIN{"Admin Login (Panel Laravel - Masa Depan)"};
        ADMIN_LOGIN -- "Berhasil Login" --> ADMIN_PANEL["Dasbor Admin"];
        ADMIN_PANEL -- "Pilih Menu 'Manage Launches'" --> ADMIN_LAUNCHES_CRUD["Halaman CRUD Launches"];
        ADMIN_LAUNCHES_CRUD -- "Aksi: Tambah/Edit/Hapus" --> ADMIN_PROCESS_DB["Proses Data ke Database Internal"];
        %% Perubahan di DB akan tercermin di halaman Launches pengguna (setelah refresh/update)
        ADMIN_PROCESS_DB -.-> F_LAUNCHES;
        ADMIN_PANEL -- "Logout" --> ADMIN_LOGIN;
    end

![alt text](mermaid-diagram-2025-05-23-081032.png)
