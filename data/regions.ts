export interface Region {
  name: string;
  divisions: {
    name: string;
    zillas: {
      name: string;
      upazilas: string[];
    }[];
  }[];
}

export const regions: Region[] = [
  {
    name: 'Bangladesh',
    divisions: [
      {
        name: 'Barishal',
        zillas: [
          { name: 'Barguna', upazilas: ['Amtali', 'Bamna', 'Barguna Sadar', 'Betagi', 'Patharghata', 'Taltali'] },
          { name: 'Barishal', upazilas: ['Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Barishal Sadar', 'Mehendiganj', 'Muladi', 'Wazirpur'] },
          { name: 'Bhola', upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
          { name: 'Jhalokati', upazilas: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'] },
          { name: 'Patuakhali', upazilas: ['Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Patuakhali Sadar', 'Rangabali', 'Dumki'] },
          { name: 'Pirojpur', upazilas: ['Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Pirojpur Sadar', 'Indurkani'] }
        ]
      },
      {
        name: 'Chattogram',
        zillas: [
          { name: 'Bandarban', upazilas: ['Bandarban Sadar', 'Thanchi', 'Lama', 'Naikhongchhari', 'Ali Kadam', 'Rowangchhari', 'Ruma'] },
          { name: 'Brahmanbaria', upazilas: ['Brahmanbaria Sadar', 'Kasba', 'Nabinagar', 'Sarail', 'Ashuganj', 'Akhaura', 'Nasirnagar', 'Bancharampur', 'Bijoynagar'] },
          { name: 'Chandpur', upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Hajiganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'] },
          { name: 'Chattogram', upazilas: ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Karnaphuli', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda'] },
          { name: 'Cumilla', upazilas: ['Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Lalmai', 'Monohorgonj', 'Meghna', 'Muradnagar', 'Nangalkot', 'Cumilla Sadar', 'Titas', 'Cumilla Sadar Dakshin'] },
          { name: 'Cox\'s Bazar', upazilas: ['Chakaria', 'Cox\'s Bazar Sadar', 'Kutubdia', 'Maheshkhali', 'Pekua', 'Ramu', 'Teknaf', 'Ukhia'] },
          { name: 'Feni', upazilas: ['Chhagalnaiya', 'Daganbhuiyan', 'Feni Sadar', 'Fulgazi', 'Parshuram', 'Sonagazi'] },
          { name: 'Khagrachhari', upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Ramgarh', 'Matiranga', 'Guimara'] },
          { name: 'Lakshmipur', upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'] },
          { name: 'Noakhali', upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat'] },
          { name: 'Rangamati', upazilas: ['Rangamati Sadar', 'Belaichhari', 'Bagaichhari', 'Barkal', 'Juraichhari', 'Rajasthali', 'Kaptai', 'Langadu', 'Naniarchar', 'Kaukhali'] }
        ]
      },
      {
        name: 'Dhaka',
        zillas: [
          { name: 'Dhaka', upazilas: ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar'] },
          { name: 'Faridpur', upazilas: ['Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Faridpur Sadar', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'] },
          { name: 'Gazipur', upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'] },
          { name: 'Gopalganj', upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
          { name: 'Kishoreganj', upazilas: ['Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kishoreganj Sadar', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'] },
          { name: 'Madaripur', upazilas: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'] },
          { name: 'Manikganj', upazilas: ['Daulatpur', 'Ghior', 'Harirampur', 'Manikganj Sadar', 'Saturia', 'Shivalaya', 'Singair'] },
          { name: 'Munshiganj', upazilas: ['Gazaria', 'Lohajang', 'Munshiganj Sadar', 'Sirajdikhan', 'Sreenagar', 'Tongibari'] },
          { name: 'Narayanganj', upazilas: ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon'] },
          { name: 'Narsingdi', upazilas: ['Belabo', 'Monohardi', 'Narsingdi Sadar', 'Palash', 'Raipura', 'Shibpur'] },
          { name: 'Rajbari', upazilas: ['Baliakandi', 'Goalandaghat', 'Pangsha', 'Rajbari Sadar', 'Kalukhali'] },
          { name: 'Shariatpur', upazilas: ['Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Shariatpur Sadar', 'Zanjira'] },
          { name: 'Tangail', upazilas: ['Gopalpur', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Tangail Sadar', 'Dhanbari'] }
        ]
      },
      {
        name: 'Khulna',
        zillas: [
          { name: 'Bagerhat', upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'] },
          { name: 'Chuadanga', upazilas: ['Alamdanga', 'Chuadanga Sadar', 'Damurhuda', 'Jibannagar'] },
          { name: 'Jashore', upazilas: ['Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Jashore Sadar', 'Manirampur', 'Sharsha'] },
          { name: 'Jhenaidah', upazilas: ['Harinakunda', 'Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'] },
          { name: 'Khulna', upazilas: ['Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada'] },
          { name: 'Kushtia', upazilas: ['Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Kushtia Sadar', 'Mirpur'] },
          { name: 'Magura', upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'] },
          { name: 'Meherpur', upazilas: ['Gangni', 'Meherpur Sadar', 'Mujibnagar'] },
          { name: 'Narail', upazilas: ['Kalia', 'Lohagara', 'Narail Sadar'] },
          { name: 'Satkhira', upazilas: ['Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Satkhira Sadar', 'Shyamnagar', 'Tala'] }
        ]
      },
      {
        name: 'Mymensingh',
        zillas: [
          { name: 'Jamalpur', upazilas: ['Baksiganj', 'Dewanganj', 'Islampur', 'Jamalpur Sadar', 'Madarganj', 'Melandaha', 'Sarishabari'] },
          { name: 'Mymensingh', upazilas: ['Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Mymensingh Sadar', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal', 'Tara Khanda'] },
          { name: 'Netrokona', upazilas: ['Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Kendua', 'Khaliajuri', 'Madan', 'Mohanganj', 'Netrokona Sadar', 'Purbadhala'] },
          { name: 'Sherpur', upazilas: ['Jhenaigati', 'Nakla', 'Nalitabari', 'Sherpur Sadar', 'Sreebardi'] }
        ]
      },
      {
        name: 'Rajshahi',
        zillas: [
          { name: 'Bogura', upazilas: ['Adamdighi', 'Bogura Sadar', 'Dhunat', 'Dupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatala'] },
          { name: 'Joypurhat', upazilas: ['Akkelpur', 'Joypurhat Sadar', 'Kalai', 'Khetlal', 'Panchbibi'] },
          { name: 'Naogaon', upazilas: ['Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mahadebpur', 'Naogaon Sadar', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'] },
          { name: 'Natore', upazilas: ['Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Natore Sadar', 'Singra', 'Naldanga'] },
          { name: 'Nawabganj', upazilas: ['Bholahat', 'Gomastapur', 'Nachole', 'Nawabganj Sadar', 'Shibganj'] },
          { name: 'Pabna', upazilas: ['Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Pabna Sadar', 'Santhia', 'Sujanagar'] },
          { name: 'Rajshahi', upazilas: ['Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'] },
          { name: 'Sirajganj', upazilas: ['Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Sirajganj Sadar', 'Tarash', 'Ullahpara'] }
        ]
      },
      {
        name: 'Rangpur',
        zillas: [
          { name: 'Dinajpur', upazilas: ['Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Dinajpur Sadar', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur', 'Phulbari'] },
          { name: 'Gaibandha', upazilas: ['Fulchhari', 'Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Sughatta', 'Sundarganj'] },
          { name: 'Kurigram', upazilas: ['Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Kurigram Sadar', 'Nageshwari', 'Phulbari', 'Rajarhat', 'Raumari', 'Ulipur'] },
          { name: 'Lalmonirhat', upazilas: ['Aditmari', 'Hatibandha', 'Kaliganj', 'Lalmonirhat Sadar', 'Patgram'] },
          { name: 'Nilphamari', upazilas: ['Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Nilphamari Sadar', 'Saidpur'] },
          { name: 'Panchagarh', upazilas: ['Atwari', 'Boda', 'Debiganj', 'Panchagarh Sadar', 'Tetulia'] },
          { name: 'Rangpur', upazilas: ['Badarganj', 'Gangachhara', 'Kaunia', 'Rangpur Sadar', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'] },
          { name: 'Thakurgaon', upazilas: ['Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Thakurgaon Sadar'] }
        ]
      },
      {
        name: 'Sylhet',
        zillas: [
          { name: 'Habiganj', upazilas: ['Ajmiriganj', 'Bahubal', 'Baniachong', 'Chunarughat', 'Habiganj Sadar', 'Lakhai', 'Madhabpur', 'Nabiganj'] },
          { name: 'Moulvibazar', upazilas: ['Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Moulvibazar Sadar', 'Rajnagar', 'Sreemangal'] },
          { name: 'Sunamganj', upazilas: ['Bishwambarpur', 'Chhatak', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Sunamganj Sadar', 'Tahirpur', 'Shantiganj'] },
          { name: 'Sylhet', upazilas: ['Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Dakshin Surma', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmani Nagar', 'Sylhet Sadar', 'Zakiganj'] }
        ]
      }
    ],
  },
  {
    name: 'USA',
    divisions: [
      {
        name: 'California',
        zillas: [
          {
            name: 'Los Angeles County',
            upazilas: ['Los Angeles', 'Long Beach', 'Glendale', 'Santa Clarita', 'Pasadena'],
          },
          {
            name: 'San Francisco County',
            upazilas: ['San Francisco'],
          },
        ],
      },
      {
        name: 'Texas',
        zillas: [
          {
            name: 'Harris County',
            upazilas: ['Houston', 'Pasadena', 'Baytown'],
          },
          {
            name: 'Dallas County',
            upazilas: ['Dallas', 'Irving', 'Garland'],
          },
        ],
      },
    ],
  },
];
