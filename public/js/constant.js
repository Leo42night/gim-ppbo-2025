const QUIZ_BANK = [
  {
    q: "OOP: Apa tujuan utama 'encapsulation'?",
    choices: [
      "Menyembunyikan detail internal dan membatasi akses langsung ke state object",
      "Membuat satu class bisa mewarisi banyak class sekaligus",
      "Mengubah semua method menjadi static agar cepat"
    ],
    correctIndex: 0,
    explain: "Encapsulation menyembunyikan detail internal dan membatasi akses langsung ke state object."
  },
  {
    q: "OOP: Apa yang dimaksud 'inheritance'?",
    choices: [
      "Membungkus data agar tidak bisa diakses dari luar",
      "Class turunan mewarisi properti/method dari class induk",
      "Menggabungkan beberapa object menjadi satu array"
    ],
    correctIndex: 1,
    explain: "Inheritance memungkinkan class turunan mewarisi properti/method dari class induk."
  },
  {
    q: "OOP: Polymorphism paling sering berarti apa?",
    choices: [
      "Satu interface, banyak implementasi",
      "Satu object hanya boleh punya satu method",
      "Menghapus constructor agar hemat memori"
    ],
    correctIndex: 0,
    explain: "Polymorphism: satu interface yang sama, perilaku bisa berbeda tergantung implementasi/tipe."
  },
  {
    q: "OOP: Apa fungsi 'abstraction'?",
    choices: [
      "Menampilkan detail implementasi serinci mungkin",
      "Menyederhanakan kompleksitas: tampilkan hal penting, sembunyikan detail",
      "Mengubah class menjadi JSON otomatis"
    ],
    correctIndex: 1,
    explain: "Abstraction menyederhanakan kompleksitas dengan menampilkan hal penting dan menyembunyikan detail."
  },
  {
    q: "OOP: Constructor biasanya dipakai untuk apa?",
    choices: [
      "Menghapus object yang tidak dipakai",
      "Menginisialisasi object saat dibuat (state awal, validasi awal, dsb.)",
      "Menjalankan garbage collector secara manual"
    ],
    correctIndex: 1,
    explain: "Constructor dipakai untuk inisialisasi object ketika dibuat."
  },
  {
    q: "OOP: Bedanya class dan object paling tepat?",
    choices: [
      "Class = instance, Object = blueprint",
      "Class = blueprint/definisi; Object = instance dari class",
      "Class = file; Object = folder"
    ],
    correctIndex: 1,
    explain: "Class adalah blueprint/definisi, object adalah instance nyata."
  },
  {
    q: "OOP: Manfaat utama 'interface' (kontrak) dalam OOP?",
    choices: [
      "Membuat semua variabel menjadi public",
      "Mendefinisikan kontrak method agar implementasi bisa ditukar tanpa ubah pemakai",
      "Menghindari penggunaan constructor"
    ],
    correctIndex: 1,
    explain: "Interface mendefinisikan kontrak sehingga implementasi bisa diganti tanpa mengubah kode pemakai."
  },
  {
    q: "OOP: Apa itu method overriding?",
    choices: [
      "Class turunan mengganti implementasi method dari class induk",
      "Memanggil method yang sama berkali-kali dalam loop",
      "Menduplikasi object tanpa constructor"
    ],
    correctIndex: 0,
    explain: "Overriding: subclass mengganti implementasi method superclass."
  },
  {
    q: "OOP: Apa itu composition (has-a) secara umum?",
    choices: [
      "Relasi has-a: object dibangun dari object lain",
      "Relasi is-a: subclass selalu lebih cepat dari superclass",
      "Relasi one-to-many yang wajib pakai inheritance"
    ],
    correctIndex: 0,
    explain: "Composition adalah relasi has-a: object tersusun dari object lain."
  },
  {
    q: "OOP: Kenapa access modifier (private/protected/public) penting?",
    choices: [
      "Untuk kontrol akses, menjaga invariants, dan mengurangi coupling",
      "Supaya semua method otomatis jadi async",
      "Agar object bisa disimpan di database tanpa ORM"
    ],
    correctIndex: 0,
    explain: "Access modifier mengontrol akses, menjaga invariants, dan mengurangi coupling."
  }
];